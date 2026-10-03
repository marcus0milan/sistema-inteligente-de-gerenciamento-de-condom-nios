using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? Environment.GetEnvironmentVariable("ConnectionStrings__Default");
var jwtKey = builder.Configuration["Jwt:Key"] ?? Environment.GetEnvironmentVariable("JWT_SIGNING_KEY");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("Configure ConnectionStrings__Default (PostgreSQL) antes de iniciar a API.");
}
if (string.IsNullOrWhiteSpace(jwtKey) || Encoding.UTF8.GetByteCount(jwtKey) < 32)
{
    throw new InvalidOperationException("Configure JWT_SIGNING_KEY com pelo menos 32 bytes para assinar os tokens.");
}

var dataSource = NpgsqlDataSource.Create(connectionString);
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
builder.Services.AddSingleton(dataSource);
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = "VivaCondo",
            ValidateAudience = true,
            ValidAudience = "VivaCondo",
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            RoleClaimType = ClaimTypes.Role,
            NameClaimType = ClaimTypes.NameIdentifier,
        };
    });
builder.Services.AddAuthorization();

var frontendPath = FindFrontendPath(builder.Environment.ContentRootPath);
var frontendProvider = new PhysicalFileProvider(frontendPath);
var app = builder.Build();

try
{
    await using var connection = await dataSource.OpenConnectionAsync();
    var schemaPath = Path.Combine(app.Environment.ContentRootPath, "database", "schema.sql");
    var schema = await File.ReadAllTextAsync(schemaPath);
    await using var command = new NpgsqlCommand(schema, connection);
    await command.ExecuteNonQueryAsync();
}
catch (Exception exception)
{
    app.Logger.LogCritical(exception, "Não foi possível conectar ao PostgreSQL ou inicializar o schema da Sprint 1.");
    throw;
}

app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = frontendProvider });
app.UseStaticFiles(new StaticFileOptions { FileProvider = frontendProvider });
app.UseAuthentication();
app.UseAuthorization();

var api = app.MapGroup("/api");
api.MapGet("/setup", async (NpgsqlDataSource db) =>
{
    await using var connection = await db.OpenConnectionAsync();
    await using var command = new NpgsqlCommand(
        """
        SELECT EXISTS (SELECT 1 FROM usuario),
               (SELECT c.nome FROM condominio c JOIN sindico s ON s.condominio_id = c.id ORDER BY c.id LIMIT 1)
        """,
        connection);
    await using var reader = await command.ExecuteReaderAsync();
    await reader.ReadAsync();
    return Results.Ok(new { initialized = reader.GetBoolean(0), condominiumName = reader.IsDBNull(1) ? null : reader.GetString(1) });
});

api.MapPost("/setup", async (SetupRequest request, NpgsqlDataSource db) =>
{
    var error = ValidateSetup(request);
    if (error is not null) return Results.BadRequest(new { message = error });

    var email = NormalizeEmail(request.Email);
    var passwordHash = HashPassword(request.Password);
    await using var connection = await db.OpenConnectionAsync();
    await using var transaction = await connection.BeginTransactionAsync();
    try
    {
        await using (var lockCommand = new NpgsqlCommand("SELECT pg_advisory_xact_lock(849201)", connection, transaction))
        {
            await lockCommand.ExecuteNonQueryAsync();
        }

        await using (var countCommand = new NpgsqlCommand("SELECT EXISTS (SELECT 1 FROM usuario)", connection, transaction))
        {
            if ((bool)(await countCommand.ExecuteScalarAsync())!)
            {
                await transaction.RollbackAsync();
                return Results.Conflict(new { message = "A configuração inicial já foi concluída." });
            }
        }

        int condominiumId;
        await using (var command = new NpgsqlCommand(
            "INSERT INTO condominio (nome, endereco) VALUES (@name, @address) RETURNING id",
            connection, transaction))
        {
            command.Parameters.AddWithValue("name", request.CondominiumName.Trim());
            command.Parameters.AddWithValue("address", request.Address.Trim());
            condominiumId = (int)(await command.ExecuteScalarAsync())!;
        }

        int userId;
        await using (var command = new NpgsqlCommand(
            """
            INSERT INTO usuario (nome, email, senha_hash, perfil)
            VALUES (@name, @email, @passwordHash, 'SINDICO')
            RETURNING id
            """,
            connection, transaction))
        {
            command.Parameters.AddWithValue("name", request.Name.Trim());
            command.Parameters.AddWithValue("email", email);
            command.Parameters.AddWithValue("passwordHash", passwordHash);
            userId = (int)(await command.ExecuteScalarAsync())!;
        }

        await using (var command = new NpgsqlCommand(
            "INSERT INTO sindico (id, condominio_id) VALUES (@userId, @condominiumId)",
            connection, transaction))
        {
            command.Parameters.AddWithValue("userId", userId);
            command.Parameters.AddWithValue("condominiumId", condominiumId);
            await command.ExecuteNonQueryAsync();
        }

        await transaction.CommitAsync();
        return Results.Created("/api/setup", new { message = "Condomínio e conta inicial criados." });
    }
    catch (PostgresException exception) when (exception.SqlState == PostgresErrorCodes.UniqueViolation)
    {
        await transaction.RollbackAsync();
        return Results.Conflict(new { message = "Este e-mail já está cadastrado." });
    }
});

api.MapPost("/auth/login", async (LoginRequest request, NpgsqlDataSource db, IConfiguration configuration) =>
{
    if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrEmpty(request.Password) ||
        request.Profile is not ("MORADOR" or "SINDICO"))
    {
        return Results.BadRequest(new { message = "Informe e-mail, senha e perfil válidos." });
    }

    await using var connection = await db.OpenConnectionAsync();
    await using var command = new NpgsqlCommand(
        """
        SELECT u.id, u.nome, u.email, u.senha_hash, u.perfil,
               COALESCE(s.condominio_id, un.condominio_id) AS condominio_id,
               c.nome AS condominio_nome, c.endereco AS condominio_endereco,
               m.unidade_id
        FROM usuario u
        LEFT JOIN sindico s ON s.id = u.id
        LEFT JOIN morador m ON m.id = u.id
        LEFT JOIN unidade un ON un.id = m.unidade_id
        LEFT JOIN condominio c ON c.id = COALESCE(s.condominio_id, un.condominio_id)
        WHERE lower(u.email) = @email AND u.perfil = @profile
        """,
        connection);
    command.Parameters.AddWithValue("email", NormalizeEmail(request.Email));
    command.Parameters.AddWithValue("profile", request.Profile);
    await using var reader = await command.ExecuteReaderAsync();
    if (!await reader.ReadAsync() || !VerifyPassword(request.Password, reader.GetString(3)))
    {
        return Results.Unauthorized();
    }

    var user = new SessionUser(
        reader.GetInt32(0),
        reader.GetString(1),
        reader.GetString(2),
        reader.GetString(4),
        reader.GetInt32(5),
        reader.GetString(6),
        reader.GetString(7),
        reader.IsDBNull(8) ? null : reader.GetInt32(8));
    var token = CreateToken(user, signingKey);
    return Results.Ok(new { token, user });
});

api.MapGet("/me", async (ClaimsPrincipal principal, NpgsqlDataSource db) =>
{
    var userId = GetUserId(principal);
    await using var connection = await db.OpenConnectionAsync();
    var user = await ReadSessionUserAsync(connection, userId);
    return user is null ? Results.Unauthorized() : Results.Ok(user);
}).RequireAuthorization();

var managerApi = api.MapGroup("").RequireAuthorization(new AuthorizeAttribute { Roles = "SINDICO" });

managerApi.MapGet("/units", async (ClaimsPrincipal principal, NpgsqlDataSource db) =>
{
    await using var connection = await db.OpenConnectionAsync();
    await using var command = new NpgsqlCommand(
        """
        SELECT u.id, u.bloco, u.numero, COUNT(m.id)::INT AS moradores
        FROM unidade u
        LEFT JOIN morador m ON m.unidade_id = u.id
        WHERE u.condominio_id = @condominiumId
        GROUP BY u.id ORDER BY lower(u.bloco), lower(u.numero)
        """,
        connection);
    command.Parameters.AddWithValue("condominiumId", GetCondominiumId(principal));
    await using var reader = await command.ExecuteReaderAsync();
    var units = new List<UnitResponse>();
    while (await reader.ReadAsync())
    {
        units.Add(new UnitResponse(reader.GetInt32(0), reader.GetString(1), reader.GetString(2), reader.GetInt32(3)));
    }
    return Results.Ok(units);
});

managerApi.MapPost("/units", async (UnitRequest request, ClaimsPrincipal principal, NpgsqlDataSource db) =>
{
    if (string.IsNullOrWhiteSpace(request.Block) || string.IsNullOrWhiteSpace(request.Number) ||
        request.Block.Trim().Length > 20 || request.Number.Trim().Length > 20)
    {
        return Results.BadRequest(new { message = "Informe bloco e número da unidade (até 20 caracteres cada)." });
    }

    await using var connection = await db.OpenConnectionAsync();
    await using var command = new NpgsqlCommand(
        """
        INSERT INTO unidade (condominio_id, bloco, numero)
        VALUES (@condominiumId, @block, @number)
        RETURNING id, bloco, numero
        """,
        connection);
    command.Parameters.AddWithValue("condominiumId", GetCondominiumId(principal));
    command.Parameters.AddWithValue("block", request.Block.Trim());
    command.Parameters.AddWithValue("number", request.Number.Trim());
    try
    {
        await using var reader = await command.ExecuteReaderAsync();
        await reader.ReadAsync();
        return Results.Created("/api/units", new UnitResponse(reader.GetInt32(0), reader.GetString(1), reader.GetString(2), 0));
    }
    catch (PostgresException exception) when (exception.SqlState == PostgresErrorCodes.UniqueViolation)
    {
        return Results.Conflict(new { message = "Já existe uma unidade com esse bloco e número." });
    }
});

managerApi.MapGet("/residents", async (ClaimsPrincipal principal, NpgsqlDataSource db) =>
{
    await using var connection = await db.OpenConnectionAsync();
    await using var command = new NpgsqlCommand(
        """
        SELECT u.id, u.nome, u.email, m.cpf, m.unidade_id
        FROM morador m
        JOIN usuario u ON u.id = m.id
        JOIN unidade un ON un.id = m.unidade_id
        WHERE un.condominio_id = @condominiumId
        ORDER BY lower(u.nome)
        """,
        connection);
    command.Parameters.AddWithValue("condominiumId", GetCondominiumId(principal));
    await using var reader = await command.ExecuteReaderAsync();
    var residents = new List<ResidentResponse>();
    while (await reader.ReadAsync())
    {
        residents.Add(new ResidentResponse(reader.GetInt32(0), reader.GetString(1), reader.GetString(2), reader.GetString(3), reader.GetInt32(4)));
    }
    return Results.Ok(residents);
});

managerApi.MapPost("/residents", async (ResidentRequest request, ClaimsPrincipal principal, NpgsqlDataSource db) =>
{
    var error = ValidateResident(request);
    if (error is not null) return Results.BadRequest(new { message = error });
    var cpf = new string(request.Cpf.Where(char.IsAsciiDigit).ToArray());
    var email = NormalizeEmail(request.Email);
    var condominiumId = GetCondominiumId(principal);
    await using var connection = await db.OpenConnectionAsync();
    await using var transaction = await connection.BeginTransactionAsync();
    try
    {
        await using (var unitCommand = new NpgsqlCommand(
            "SELECT EXISTS (SELECT 1 FROM unidade WHERE id = @unitId AND condominio_id = @condominiumId)",
            connection, transaction))
        {
            unitCommand.Parameters.AddWithValue("unitId", request.UnitId);
            unitCommand.Parameters.AddWithValue("condominiumId", condominiumId);
            if (!(bool)(await unitCommand.ExecuteScalarAsync())!)
            {
                await transaction.RollbackAsync();
                return Results.BadRequest(new { message = "Selecione uma unidade existente deste condomínio." });
            }
        }

        int userId;
        await using (var userCommand = new NpgsqlCommand(
            """
            INSERT INTO usuario (nome, email, senha_hash, perfil)
            VALUES (@name, @email, @passwordHash, 'MORADOR')
            RETURNING id
            """,
            connection, transaction))
        {
            userCommand.Parameters.AddWithValue("name", request.Name.Trim());
            userCommand.Parameters.AddWithValue("email", email);
            userCommand.Parameters.AddWithValue("passwordHash", HashPassword(request.Password));
            userId = (int)(await userCommand.ExecuteScalarAsync())!;
        }

        await using (var residentCommand = new NpgsqlCommand(
            "INSERT INTO morador (id, cpf, unidade_id) VALUES (@id, @cpf, @unitId)",
            connection, transaction))
        {
            residentCommand.Parameters.AddWithValue("id", userId);
            residentCommand.Parameters.AddWithValue("cpf", cpf);
            residentCommand.Parameters.AddWithValue("unitId", request.UnitId);
            await residentCommand.ExecuteNonQueryAsync();
        }

        await transaction.CommitAsync();
        return Results.Created("/api/residents", new ResidentResponse(userId, request.Name.Trim(), email, cpf, request.UnitId));
    }
    catch (PostgresException exception) when (exception.SqlState == PostgresErrorCodes.UniqueViolation)
    {
        await transaction.RollbackAsync();
        var message = exception.ConstraintName == "morador_cpf_key"
            ? "Já existe um morador cadastrado com esse CPF."
            : "Já existe um usuário cadastrado com esse e-mail.";
        return Results.Conflict(new { message });
    }
});

api.MapGet("/areas", async (ClaimsPrincipal principal, NpgsqlDataSource db) =>
{
    await using var connection = await db.OpenConnectionAsync();
    await using var command = new NpgsqlCommand(
        """
        SELECT id, nome, capacidade_maxima, to_char(horario_limite_uso, 'HH24:MI')
        FROM area_comum WHERE condominio_id = @condominiumId
        ORDER BY lower(nome)
        """,
        connection);
    command.Parameters.AddWithValue("condominiumId", GetCondominiumId(principal));
    await using var reader = await command.ExecuteReaderAsync();
    var areas = new List<AreaResponse>();
    while (await reader.ReadAsync())
    {
        areas.Add(new AreaResponse(reader.GetInt32(0), reader.GetString(1), reader.GetInt32(2), reader.GetString(3)));
    }
    return Results.Ok(areas);
}).RequireAuthorization();

managerApi.MapPost("/areas", async (AreaRequest request, ClaimsPrincipal principal, NpgsqlDataSource db) =>
{
    var error = ValidateArea(request);
    if (error is not null) return Results.BadRequest(new { message = error });

    await using var connection = await db.OpenConnectionAsync();
    await using var command = new NpgsqlCommand(
        """
        INSERT INTO area_comum (condominio_id, nome, capacidade_maxima, horario_limite_uso)
        VALUES (@condominiumId, @name, @capacity, @usageLimit)
        RETURNING id, nome, capacidade_maxima, to_char(horario_limite_uso, 'HH24:MI')
        """,
        connection);
    command.Parameters.AddWithValue("condominiumId", GetCondominiumId(principal));
    command.Parameters.AddWithValue("name", request.Name.Trim());
    command.Parameters.AddWithValue("capacity", request.Capacity);
    command.Parameters.AddWithValue("usageLimit", TimeOnly.Parse(request.UsageLimit));
    try
    {
        await using var reader = await command.ExecuteReaderAsync();
        await reader.ReadAsync();
        return Results.Created("/api/areas", new AreaResponse(reader.GetInt32(0), reader.GetString(1), reader.GetInt32(2), reader.GetString(3)));
    }
    catch (PostgresException exception) when (exception.SqlState == PostgresErrorCodes.UniqueViolation)
    {
        return Results.Conflict(new { message = "Já existe uma área comum com esse nome neste condomínio." });
    }
}).RequireAuthorization();

app.Run();

static string FindFrontendPath(string contentRoot)
{
    var current = new DirectoryInfo(contentRoot);
    while (current is not null)
    {
        var candidate = Path.Combine(current.FullName, "frontend");
        if (File.Exists(Path.Combine(candidate, "index.html"))) return candidate;
        current = current.Parent;
    }
    throw new DirectoryNotFoundException("Não foi possível localizar frontend/index.html.");
}

static async Task<SessionUser?> ReadSessionUserAsync(NpgsqlConnection connection, int userId)
{
    await using var command = new NpgsqlCommand(
        """
        SELECT u.id, u.nome, u.email, u.perfil,
               COALESCE(s.condominio_id, un.condominio_id) AS condominio_id,
               c.nome AS condominio_nome, c.endereco AS condominio_endereco,
               m.unidade_id
        FROM usuario u
        LEFT JOIN sindico s ON s.id = u.id
        LEFT JOIN morador m ON m.id = u.id
        LEFT JOIN unidade un ON un.id = m.unidade_id
        LEFT JOIN condominio c ON c.id = COALESCE(s.condominio_id, un.condominio_id)
        WHERE u.id = @userId
        """,
        connection);
    command.Parameters.AddWithValue("userId", userId);
    await using var reader = await command.ExecuteReaderAsync();
    if (!await reader.ReadAsync()) return null;
    return new SessionUser(
        reader.GetInt32(0),
        reader.GetString(1),
        reader.GetString(2),
        reader.GetString(3),
        reader.GetInt32(4),
        reader.GetString(5),
        reader.GetString(6),
        reader.IsDBNull(7) ? null : reader.GetInt32(7));
}

static int GetUserId(ClaimsPrincipal principal) =>
    int.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException());

static int GetCondominiumId(ClaimsPrincipal principal) =>
    int.Parse(principal.FindFirstValue("condominium_id") ?? throw new UnauthorizedAccessException());

static string CreateToken(SessionUser user, SymmetricSecurityKey signingKey)
{
    var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Role, user.Profile),
        new Claim("condominium_id", user.CondominiumId.ToString()),
    };
    var token = new JwtSecurityToken(
        issuer: "VivaCondo",
        audience: "VivaCondo",
        claims: claims,
        expires: DateTime.UtcNow.AddHours(8),
        signingCredentials: credentials);
    return new JwtSecurityTokenHandler().WriteToken(token);
}

static string HashPassword(string password)
{
    const int iterations = 310_000;
    var salt = RandomNumberGenerator.GetBytes(16);
    var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, 32);
    return $"PBKDF2-SHA256${iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
}

static bool VerifyPassword(string password, string storedHash)
{
    var parts = storedHash.Split('$');
    if (parts.Length != 4 || parts[0] != "PBKDF2-SHA256" ||
        !int.TryParse(parts[1], out var iterations) || iterations < 100_000 || iterations > 1_000_000)
    {
        return false;
    }
    try
    {
        var salt = Convert.FromBase64String(parts[2]);
        var expected = Convert.FromBase64String(parts[3]);
        var actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, expected.Length);
        return CryptographicOperations.FixedTimeEquals(actual, expected);
    }
    catch (FormatException)
    {
        return false;
    }
}

static string? ValidateSetup(SetupRequest request)
{
    if (request.CondominiumName is null || request.Address is null || request.Name is null ||
        request.Email is null || request.Password is null)
        return "Preencha todos os campos.";
    if (string.IsNullOrWhiteSpace(request.CondominiumName) || request.CondominiumName.Trim().Length > 150)
        return "Informe o nome do condomínio (até 150 caracteres).";
    if (string.IsNullOrWhiteSpace(request.Address) || request.Address.Trim().Length > 255)
        return "Informe o endereço (até 255 caracteres).";
    if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Trim().Length > 100)
        return "Informe o nome do síndico (até 100 caracteres).";
    if (!IsValidEmail(request.Email)) return "Informe um e-mail válido (até 150 caracteres).";
    return ValidatePassword(request.Password);
}

static string? ValidateResident(ResidentRequest request)
{
    if (request.Name is null || request.Email is null || request.Cpf is null || request.Password is null)
        return "Preencha todos os campos.";
    if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Trim().Length > 100)
        return "Informe o nome do morador (até 100 caracteres).";
    if (!IsValidEmail(request.Email)) return "Informe um e-mail válido (até 150 caracteres).";
    if (!IsValidCpf(request.Cpf)) return "Informe um CPF válido.";
    if (request.UnitId <= 0) return "Selecione uma unidade existente.";
    return ValidatePassword(request.Password);
}

static string? ValidateArea(AreaRequest request)
{
    if (request.Name is null || request.UsageLimit is null)
        return "Preencha todos os campos.";
    if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Trim().Length > 100)
        return "Informe o nome da área comum (até 100 caracteres).";
    if (request.Capacity <= 0) return "A capacidade máxima deve ser maior que zero.";
    if (!TimeOnly.TryParse(request.UsageLimit, out _)) return "Informe um horário limite válido.";
    return null;
}

static string? ValidatePassword(string password) =>
    string.IsNullOrEmpty(password) || password.Length < 8
        ? "A senha deve ter no mínimo 8 caracteres."
        : null;

static bool IsValidEmail(string email) =>
    !string.IsNullOrWhiteSpace(email) &&
    email.Trim().Length <= 150 &&
    System.Net.Mail.MailAddress.TryCreate(email.Trim(), out var address) &&
    address.Address.Equals(email.Trim(), StringComparison.OrdinalIgnoreCase);

static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

static bool IsValidCpf(string value)
{
    var cpf = new string(value.Where(char.IsAsciiDigit).ToArray());
    if (cpf.Length != 11 || cpf.All(character => character == cpf[0])) return false;

    for (var digitIndex = 9; digitIndex <= 10; digitIndex++)
    {
        var sum = 0;
        for (var index = 0; index < digitIndex; index++)
            sum += (cpf[index] - '0') * (digitIndex + 1 - index);
        var remainder = (sum * 10) % 11;
        var expected = remainder == 10 ? 0 : remainder;
        if (cpf[digitIndex] - '0' != expected) return false;
    }
    return true;
}

record SetupRequest(string CondominiumName, string Address, string Name, string Email, string Password);
record LoginRequest(string Email, string Password, string Profile);
record UnitRequest(string Block, string Number);
record ResidentRequest(string Name, string Email, string Cpf, int UnitId, string Password);
record AreaRequest(string Name, int Capacity, string UsageLimit);
record SessionUser(int Id, string Name, string Email, string Profile, int CondominiumId, string CondominiumName, string Address, int? UnitId);
record UnitResponse(int Id, string Block, string Number, int ResidentCount);
record ResidentResponse(int Id, string Name, string Email, string Cpf, int UnitId);
record AreaResponse(int Id, string Name, int Capacity, string UsageLimit);
