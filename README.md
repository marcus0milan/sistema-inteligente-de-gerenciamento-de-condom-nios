# Sistema Inteligente de Gerenciamento de Condomínios

Projeto de gestão condominial com módulos planejados de controle financeiro, logístico e de segurança. A integração com assistente virtual via API da OpenAI, análise de sentimentos e monitoramento de acesso ainda não foi implementada.

**Deploy:** ainda não publicado — previsto para Semana X
**Equipe:** Guilherme Rastelli (2840482421047) · Felipe Savegnago (2840482421034) · Marcus Milan (2840482421001) · Laboratório de Engenharia de Software · ADS Fatec Ribeirão Preto

## Stack
- Frontend atual: HTML, CSS e JavaScript, sem dependências ou etapa de build
- Backend: C# com .NET 8 (ASP.NET Core)
- Banco de dados: PostgreSQL 15+
- Integração de IA planejada: API da OpenAI

## Incremento da Sprint 1
O frontend permite configurar o condomínio e o primeiro acesso de síndico, entrar como síndico ou morador, cadastrar unidades e moradores vinculados e cadastrar áreas comuns. O protótipo valida senha mínima de 8 caracteres, CPF, vínculo a uma unidade existente, duplicidade de bloco/número e duplicidade de nome de área.

O frontend da Sprint 1 usa a API e o PostgreSQL: a senha é derivada no servidor, o acesso é controlado por token/perfil e os dados são persistidos no banco. A API valida CPF, vínculo de morador, duplicidade de unidade/área e permissões do síndico.

## Como rodar localmente
Requisitos: .NET 8 SDK e PostgreSQL 15+.

1. Crie um banco PostgreSQL vazio para esta aplicação (não reutilize um banco com dados nem o banco de exemplo carregado pelo script completo da E3):

```powershell
psql -U postgres -c "CREATE DATABASE vivacondo;"
```

   A API cria as tabelas do escopo Sprint 1 na inicialização.
2. No PowerShell, configure a conexão, gere uma chave JWT local e inicie a API:

```powershell
$env:ConnectionStrings__Default = "Host=localhost;Port=5432;Database=vivacondo;Username=postgres;Password=SUA_SENHA_LOCAL"
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$env:JWT_SIGNING_KEY = [Convert]::ToBase64String($bytes)
$rng.Dispose()
$env:ASPNETCORE_URLS = "http://localhost:5080"
dotnet run --project backend\VivaCondo.Api\VivaCondo.Api.csproj
```

3. Abra `http://localhost:5080`. No primeiro acesso, cadastre o condomínio e o primeiro síndico. O síndico pode então cadastrar unidades, moradores e áreas comuns; o morador entra com as credenciais criadas pelo síndico.

Não use credenciais ou dados pessoais reais em ambientes de demonstração. A chave JWT deve ser mantida em variável de ambiente e trocada em cada ambiente.

## Estrutura do repositório
```
/frontend                  — interface web da Sprint 1
/backend/VivaCondo.Api     — API ASP.NET Core e schema PostgreSQL da Sprint 1
/docs                      — documentação do projeto
```

## Convenções da equipe
- Branches: `feature/nome-da-feature`
- Commits: Conventional Commits
- Toda PR exige revisão de ao menos 1 integrante antes do merge.

## Validação da Sprint 1
Build da API: `dotnet build backend\VivaCondo.Api\VivaCondo.Api.csproj`.

Fluxos manuais recomendados com a API e PostgreSQL em execução:
- Configuração inicial uma única vez e rejeição de nova configuração após a criação do primeiro síndico.
- Login com perfil correto, senha incorreta e perfil incompatível.
- Cadastro de unidade; tentativa de duplicar bloco/número sem diferenciar maiúsculas.
- Cadastro de morador com CPF válido e unidade existente; rejeição de CPF inválido, CPF/e-mail duplicado ou unidade de outro condomínio.
- Cadastro de área com capacidade/horário válidos; rejeição de capacidade inválida e nome duplicado.
- Confirmar que morador não acessa operações administrativas e que cadastros continuam após reiniciar a API.

O script aplicado na inicialização está em `backend\VivaCondo.Api\database\schema.sql`. A Sprint 1 não inclui reservas, chamados, upload do regimento ou integração de IA.

## Licença / Uso acadêmico
Projeto desenvolvido para a disciplina de Laboratório de Engenharia de Software — ADS, Fatec Ribeirão Preto, 2026.
