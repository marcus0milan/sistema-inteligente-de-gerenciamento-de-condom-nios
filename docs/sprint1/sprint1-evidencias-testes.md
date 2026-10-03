# Evidências de Teste — Sprint 1

## 1. Escopo

Este documento registra os testes executados para as três histórias planejadas para a Sprint 1 no backlog priorizado:

- **#1 — Autenticação:** login de síndico e morador, senha mínima e permissões por perfil.
- **#2 — Unidades e moradores:** unidade única por bloco/número, CPF válido e vínculo do morador a unidade existente.
- **#3 — Áreas comuns:** campos obrigatórios e nome único no condomínio.

## 2. Ambiente de teste

| Item | Valor |
|---|---|
| API | ASP.NET Core / .NET 8 |
| Banco de dados | PostgreSQL, banco `vivacondo` |
| Execução | Local, `http://localhost:5080` |
| Tipo de validação | Build da API e testes manuais pela interface e API |
| Dados utilizados | Dados demonstrativos de QA no banco local |

As credenciais e os dados pessoais completos usados nos testes não são reproduzidos neste documento.

## 3. Resultados

| ID | Cenário | Resultado esperado | Resultado obtido | Situação |
|---|---|---|---|---|
| T1 | Criar configuração inicial do condomínio e conta de síndico | Criar condomínio e primeiro síndico uma única vez | API respondeu `201 Created`; configuração e conta criadas | Aprovado |
| T2 | Entrar com credenciais válidas de síndico | Autenticar e permitir acesso às funções administrativas | Login respondeu `200 OK`; painel administrativo carregou | Aprovado |
| T3 | Entrar com senha inválida | Recusar autenticação | API respondeu `401 Unauthorized` | Aprovado |
| T4 | Cadastrar unidade para o condomínio | Persistir bloco e número informados | Unidade de QA cadastrada e retornada na listagem da API | Aprovado |
| T5 | Cadastrar unidade repetindo bloco/número, inclusive com diferença de maiúsculas/minúsculas | Rejeitar duplicidade | API respondeu `409 Conflict`; unidade duplicada não foi criada | Aprovado |
| T6 | Cadastrar morador com CPF válido e unidade existente | Criar usuário morador vinculado à unidade | API respondeu `201 Created`; morador apareceu na listagem com a unidade vinculada | Aprovado |
| T7 | Cadastrar morador com CPF inválido | Rejeitar o CPF | API respondeu `400 Bad Request` com mensagem de CPF inválido | Aprovado |
| T8 | Cadastrar outro morador com CPF já utilizado | Rejeitar duplicidade do CPF | API respondeu `409 Conflict` com mensagem de CPF já cadastrado | Aprovado |
| T9 | Cadastrar morador com unidade inexistente ou não pertencente ao condomínio | Rejeitar o vínculo | API respondeu `400 Bad Request`; morador não foi criado | Aprovado |
| T10 | Entrar com credenciais válidas de morador | Autenticar com o perfil morador | Login respondeu `200 OK`; painel de morador carregou | Aprovado |
| T11 | Morador tentar acessar endpoint de unidades administrativas | Negar acesso administrativo | API respondeu `403 Forbidden` | Aprovado |
| T12 | Cadastrar área comum com nome, capacidade e horário limite | Persistir a área e exibi-la na listagem | Área de QA cadastrada; API respondeu `201 Created` | Aprovado |
| T13 | Cadastrar área com nome duplicado, variando maiúsculas/minúsculas | Rejeitar duplicidade no condomínio | API respondeu `409 Conflict`; área duplicada não foi criada | Aprovado |
| T14 | Compilar a API | Build sem erros | `dotnet build` finalizou com 0 erros e 0 avisos | Aprovado |

## 4. Evidências registradas

- Respostas HTTP observadas durante os testes locais: `201`, `200`, `400`, `401`, `403` e `409`, de acordo com os cenários acima.
- Os dados cadastrados foram consultados novamente pela API, confirmando persistência no PostgreSQL após as operações.
- A validação foi manual; não foi criado nem executado um conjunto automatizado de testes unitários ou de integração.
- Capturas de tela, gravação de vídeo e execução em CI: `[]`.

## 5. Observações

Durante os testes, a validação de CPF rejeitou inicialmente CPFs válidos. A condição foi corrigida e a API recompilada; após reiniciar a API, o cadastro com CPF válido retornou `201 Created`, enquanto CPF inválido e CPF duplicado foram rejeitados conforme esperado.

Os resultados documentam o ambiente local de desenvolvimento e não representam deploy público ou execução em ambiente de produção.
