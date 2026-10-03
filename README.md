# Sistema Inteligente de Gerenciamento de Condomínios

Projeto de gestão condominial com módulos planejados de controle financeiro, logístico e de segurança. Reservas, abertura de chamados e consulta ao regimento via assistente estão implementadas; análise de sentimentos e monitoramento de acesso permanecem fora do incremento atual.

**Deploy:** ainda não publicado — previsto para Semana X
**Equipe:** Guilherme Rastelli (2840482421047) · Felipe Savegnago (2840482421034) · Marcus Milan (2840482421001) · Laboratório de Engenharia de Software · ADS Fatec Ribeirão Preto

## Stack
- Frontend atual: HTML, CSS e JavaScript, sem dependências ou etapa de build
- Backend: C# com .NET 8 (ASP.NET Core)
- Banco de dados: PostgreSQL 15+
- Assistente do regimento: API da OpenAI, com chave configurada localmente

## Incremento das Sprints 1 e 2
O frontend permite configurar o condomínio e o primeiro acesso de síndico, entrar como síndico ou morador, cadastrar unidades e moradores vinculados e cadastrar áreas comuns. O morador também pode solicitar reservas, abrir chamados de manutenção e fazer perguntas ao assistente com base no regimento fornecido.

O sistema usa a API e o PostgreSQL: a senha é derivada no servidor, o acesso é controlado por token/perfil e os dados são persistidos no banco. A API valida CPF, vínculo do morador, permissões, conflitos de horário e limite mensal de reservas. O limite inicial é de 2 reservas ativas por unidade/mês; reservas pendentes e confirmadas contam para esse limite.

O assistente envia à API da OpenAI somente trechos relevantes do arquivo de regimento configurado. Se a busca não encontrar conteúdo relacionado, responde que não encontrou a informação no documento. Para esta entrega, configure um arquivo de texto com o conteúdo do regimento; o arquivo deve ser fornecido localmente.

## Como rodar localmente

Para executar em outro computador, cada pessoa precisa ter o repositório, o **.NET 8 SDK** e um **PostgreSQL 15 ou superior** instalados. Esta configuração roda a aplicação localmente na máquina de quem a executa; não publica um site para outras pessoas acessarem pela internet.

### 1. Obtenha o projeto e instale os pré-requisitos

- Clone ou baixe este repositório e abra um terminal na pasta raiz (a pasta que contém `README.md`).
- Instale o .NET 8 SDK e o PostgreSQL 15+. O serviço do PostgreSQL deve estar em execução.
- Para criar o banco pelo terminal, instale/disponibilize também o cliente `psql`. Alternativamente, crie o banco pelo pgAdmin.

Confirme que o terminal está na raiz do projeto:

```text
README.md
backend/
frontend/
```

### 2. Crie um banco de dados vazio

Crie um banco chamado `vivacondo`. Pelo terminal, o comando é:

```sh
psql -h localhost -U postgres -c "CREATE DATABASE vivacondo;"
```

Informe a senha do usuário PostgreSQL quando solicitado. Se seu usuário ou porta forem diferentes, adapte-os no comando e na connection string da etapa seguinte. No pgAdmin, a alternativa é criar um banco chamado `vivacondo` conectado ao seu servidor local.

**Use um banco vazio e exclusivo para esta aplicação.** Não carregue nele o script de exemplo de `docs/modelagem/e3c.md` nem reutilize um banco com tabelas de outro exercício. A API cria/atualiza o schema necessário na inicialização; os dados permanecem no PostgreSQL entre execuções.

### 3. Configure e inicie a API

Execute os comandos a partir da raiz do repositório. Configure a connection string com a senha do seu próprio usuário PostgreSQL e gere uma chave JWT aleatória localmente. Não compartilhe nem salve a senha ou a chave no repositório.

**Windows — PowerShell:**

```powershell
$env:ConnectionStrings__Default = "Host=localhost;Port=5432;Database=vivacondo;Username=postgres;Password=SUBSTITUA_PELA_SENHA_DO_POSTGRES"
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$env:JWT_SIGNING_KEY = [Convert]::ToBase64String($bytes)
$rng.Dispose()
$env:ASPNETCORE_URLS = "http://localhost:5080"
dotnet run --project backend\VivaCondo.Api\VivaCondo.Api.csproj
```

**macOS ou Linux — Bash:**

```sh
export ConnectionStrings__Default='Host=localhost;Port=5432;Database=vivacondo;Username=postgres;Password=SUBSTITUA_PELA_SENHA_DO_POSTGRES'
export JWT_SIGNING_KEY="$(openssl rand -base64 32)"
export ASPNETCORE_URLS='http://localhost:5080'
dotnet run --project backend/VivaCondo.Api/VivaCondo.Api.csproj
```

O primeiro `dotnet run` restaura as dependências NuGet e compila a API; é necessário ter acesso aos feeds NuGet nessa primeira execução. Mantenha esse terminal aberto enquanto estiver usando a aplicação. Quando aparecer a mensagem de que está ouvindo em `http://localhost:5080`, abra esse endereço no navegador. No primeiro acesso, cadastre o condomínio e o primeiro síndico; depois, o síndico pode cadastrar unidades, moradores e áreas comuns.

Se `dotnet` não for reconhecido, instale o **SDK** (não apenas o runtime), feche e reabra o terminal e confirme com `dotnet --list-sdks`. Se houver erro de conexão, confira se o PostgreSQL está iniciado, se o banco foi criado e se usuário, senha, host e porta da connection string correspondem à instalação local.

### Assistente do regimento (opcional)

O restante do sistema — configuração, login, cadastros, reservas e chamados — pode ser iniciado sem chave da OpenAI ou arquivo do regimento. Para habilitar o assistente, configure também `OPENAI_API_KEY` com uma chave própria e `REGIMENTO_PATH` apontando para um arquivo de texto local com o conteúdo do regimento. No PowerShell, por exemplo:

```powershell
$env:OPENAI_API_KEY = "SUA_CHAVE_DA_OPENAI"
$env:REGIMENTO_PATH = "C:\caminho\para\regimento.txt"
```

No Bash, use `export OPENAI_API_KEY='SUA_CHAVE_DA_OPENAI'` e `export REGIMENTO_PATH='/caminho/para/regimento.txt'`. O arquivo e a chave são individuais, não estão incluídos no repositório, e não devem ser enviados em commits. A API usa `gpt-4o-mini` por padrão.

Não use credenciais ou dados pessoais reais em ambientes de demonstração. As variáveis configuradas no terminal valem para aquela sessão; gere uma chave JWT própria em cada ambiente.
## Estrutura do repositório
```
/frontend                  — interface web das Sprints 1 e 2
/backend/VivaCondo.Api     — API ASP.NET Core e schema PostgreSQL
/docs                      — documentação do projeto
```

## Convenções da equipe
- Branches: `feature/nome-da-feature`
- Commits: Conventional Commits
- Toda PR exige revisão de ao menos 1 integrante antes do merge.

## Validação
Build da API: `dotnet build backend\VivaCondo.Api\VivaCondo.Api.csproj`.

Fluxos manuais recomendados com a API e PostgreSQL em execução:
- Configuração inicial uma única vez e rejeição de nova configuração após a criação do primeiro síndico.
- Login com perfil correto, senha incorreta e perfil incompatível.
- Cadastro de unidade; tentativa de duplicar bloco/número sem diferenciar maiúsculas.
- Cadastro de morador com CPF válido e unidade existente; rejeição de CPF inválido, CPF/e-mail duplicado ou unidade de outro condomínio.
- Cadastro de área com capacidade/horário válidos; rejeição de capacidade inválida e nome duplicado.
- Confirmar que morador não acessa operações administrativas e que cadastros continuam após reiniciar a API.
- Solicitar duas reservas com horários sobrepostos na mesma área e confirmar que a segunda é rejeitada; verificar também o limite de duas reservas ativas por unidade no mês e o horário limite da área.
- Abrir chamado com categoria, localização e descrição; confirmar status inicial “ABERTO” no banco.
- Consultar o assistente com uma pergunta respondida pelo regimento e outra sem resposta nele; confirmar que a segunda recebe a mensagem de informação não encontrada.

Os três últimos itens validam as histórias #4, #5 e #6 da Sprint 2. O build confirma a compilação da API, mas não substitui esses testes funcionais com PostgreSQL e, para o assistente, com `OPENAI_API_KEY` e `REGIMENTO_PATH` configurados. O estado conhecido da validação está em [Evidências de Validação – Sprint 2](docs/sprint2/evidencias-testes-sprint2.md).

O script aplicado na inicialização está em `backend\VivaCondo.Api\database\schema.sql`. Reservas e chamados são armazenados no PostgreSQL; o regimento continua sendo fornecido por arquivo de texto local, sem funcionalidade de upload nesta sprint.

## Licença / Uso acadêmico
Projeto desenvolvido para a disciplina de Laboratório de Engenharia de Software — ADS, Fatec Ribeirão Preto, 2026.
