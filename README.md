# Sistema Inteligente de Gerenciamento de Condomínios

Sistema de gestão condominial integrado à Inteligência Artificial, com módulos de controle financeiro, logístico e de segurança. Utiliza um assistente virtual (via API da OpenAI) para interpretar o regimento interno e responder dúvidas dos moradores em tempo real, além de análise de sentimentos para identificar problemas recorrentes e um protótipo de monitoramento de acesso para segurança preditiva.

**Deploy:** ainda não publicado — previsto para Semana X
**Equipe:** Guilherme Rastelli (2840482421047) · Felipe Savegnago (2840482421034) · Marcus Milan (2840482421001) · Laboratório de Engenharia de Software · ADS Fatec Ribeirão Preto

## Stack
- Frontend: React ou HTML/JS *(definição final pendente)*
- Backend: C# com .NET 6/8
- Banco de dados: MySQL, com Entity Framework Core para persistência
- Integração de IA: API gpt-4 da OpenAI, consumida via biblioteca RestSharp

## Como rodar localmente
### Pré-requisitos
- .NET SDK 6.0 ou 8.0
- MySQL (versão 8.x recomendada)
- Node.js [versão mínima] *(caso o frontend seja em React)*
- Uma API key válida da OpenAI

### Passo a passo
1. Clone o repositório: `git clone [url]`
2. Instale as dependências do backend: `dotnet restore`
3. Configure as variáveis de ambiente (copie `.env.example` para `.env` e preencha):

   | Variável | Descrição |
   |---|---|
   | `OPENAI_API_KEY` | Chave de acesso à API da OpenAI (usada pelo assistente virtual) |
   | `DB_CONNECTION_STRING` | String de conexão com o MySQL |
   | `JWT_SECRET` | Chave para geração/validação de tokens de autenticação |

4. Crie o banco e rode o schema: `[comando]`
5. Rode as migrations/seed (se houver): `dotnet ef database update`
6. Suba o projeto: `dotnet run`
7. Acesse em `http://localhost:[porta]`

## Estrutura do repositório
```
/src            — código-fonte da API (.NET) e lógica de negócios
/src/Modulos    — módulos financeiro, logístico e de segurança
/src/IA         — integração com a API da OpenAI (chatbot, análise de sentimentos)
/frontend       — interface web (React ou HTML/JS)
/docs           — documentação do projeto, incluindo este TCC
```

## Convenções da equipe
- Branches: `feature/nome-da-feature`
- Commits: Conventional Commits
- Toda PR exige revisão de ao menos 1 integrante antes do merge.

## Testes
Como rodar: validação de endpoints via Swagger e testes de usabilidade do chatbot (precisão das respostas em cenários simulados de dúvidas/conflitos dos moradores).

## Licença / Uso acadêmico
Projeto desenvolvido para a disciplina de Laboratório de Engenharia de Software — ADS, Fatec Ribeirão Preto, 2026.
