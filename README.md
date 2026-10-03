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
Requisitos: .NET 8 SDK e PostgreSQL 15+.

1. Crie um banco PostgreSQL vazio para esta aplicação (não reutilize um banco com dados nem o banco de exemplo carregado pelo script completo da E3):

```powershell
psql -U postgres -c "CREATE DATABASE vivacondo;"
```

   A API cria as tabelas necessárias às Sprints 1 e 2 na inicialização.
2. No PowerShell, configure a conexão, gere uma chave JWT local e inicie a API:

```powershell
$env:ConnectionStrings__Default = "Host=localhost;Port=5432;Database=vivacondo;Username=postgres;Password=SUA_SENHA_LOCAL"
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$env:JWT_SIGNING_KEY = [Convert]::ToBase64String($bytes)
$rng.Dispose()
$env:ASPNETCORE_URLS = "http://localhost:5080"
$env:OPENAI_API_KEY = "sua-chave-local"
$env:REGIMENTO_PATH = "C:\caminho\para\regimento.txt"
dotnet run --project backend\VivaCondo.Api\VivaCondo.Api.csproj
```

3. Abra `http://localhost:5080`. No primeiro acesso, cadastre o condomínio e o primeiro síndico. O síndico pode então cadastrar unidades, moradores e áreas comuns; o morador entra com as credenciais criadas pelo síndico.

Não use credenciais ou dados pessoais reais em ambientes de demonstração. A chave JWT deve ser mantida em variável de ambiente e trocada em cada ambiente.

As variáveis `OPENAI_API_KEY` e `REGIMENTO_PATH` são necessárias para usar o assistente; login, reservas e chamados não dependem delas. `REGIMENTO_PATH` pode ser absoluto ou relativo ao diretório do projeto da API. Não adicione chaves ou documentos privados ao repositório. A API usa o modelo `gpt-4o-mini` por padrão.

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
