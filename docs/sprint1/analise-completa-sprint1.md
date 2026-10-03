# Análise de Conclusão — Sprint 1

**Data da análise:** 03/10/2026  
**Escopo considerado:** histórias #1, #2 e #3 marcadas como Sprint 1 no [backlog priorizado](../../backlog/sprint1/e2a.md).  
**Base da análise:** documentos disponíveis, código atual do frontend e da API, schema PostgreSQL e build da API.

## Status geral

**As três histórias da Sprint 1 estão implementadas de acordo com os critérios registrados no backlog.** A API compila atualmente com 0 avisos e 0 erros, e há registro de 14 cenários de teste manual, além de capturas de tela e vídeo.

A conclusão é **funcionalmente sustentada, mas a documentação ainda precisa de alinhamento**. Os documentos E3 descrevem um escopo de Sprint 1 diferente do backlog priorizado; há também divergência entre o README, a retrospectiva da Sprint 2 e o estado atual do código sobre as funcionalidades daquela sprint. A cobertura de testes apresentada é manual e não comprova individualmente todos os critérios negativos.

Não foi identificada uma história funcional de Sprint 1 ausente na implementação. A ausência de deploy público, testes automatizados, board/histórico de cards e dados da Sprint Review limita as evidências ou diz respeito à conclusão geral do MVP; esses itens não aparecem como critérios de aceite das histórias #1–#3 no backlog.

## Requisitos verificados

| História e critério | Implementação observada | Documentação e evidência | Status |
|---|---|---|---|
| **#1 — Autenticar morador e síndico com e-mail e senha** | API autentica por e-mail, senha e perfil; o frontend oferece os dois perfis. | Documentado no [relatório de entrega](./relatório-de-entrega-sprint1.md); testes manuais de login dos dois perfis e senha inválida em [evidências](./sprint1-evidencias-testes.md). | **Atendido** |
| **#1 — Separar rotas e permissões por perfil** | Rotas administrativas exigem perfil `SINDICO`; operações de morador previstas no código exigem `MORADOR`; consulta de áreas requer autenticação. | T11 registra resposta `403 Forbidden` quando morador tenta acessar operação administrativa. | **Atendido** |
| **#1 — Exigir senha com pelo menos 8 caracteres** | Validação no servidor durante a configuração inicial e criação de morador; formulários também indicam e aplicam o mínimo. | O critério consta no relatório e no README, mas a tabela de testes não registra uma tentativa específica com senha menor que 8 caracteres. | **Implementado; evidência de teste incompleta** |
| **#1 — Mensagem clara para credenciais inválidas** | A API recusa a autenticação e o frontend apresenta mensagem compreensível para credenciais/perfil inválidos. | T3 registra resposta `401 Unauthorized`; a mensagem exibida está no frontend. | **Atendido** |
| **#2 — Bloco e número da unidade únicos** | Índice único no banco por condomínio, bloco e número, sem distinção entre maiúsculas/minúsculas; API devolve conflito em duplicidade. | T4 e T5 registram criação e rejeição de duplicidade, inclusive com variação de caixa. | **Atendido** |
| **#2 — Validar CPF com constraint no banco** | CPF é validado na API e por constraint/função no schema PostgreSQL; CPF duplicado também é bloqueado. | T6–T8 registram CPF válido, inválido e duplicado. | **Atendido** |
| **#2 — Vincular morador a uma unidade existente** | API confirma que a unidade existe no mesmo condomínio do síndico autenticado; a chave estrangeira mantém a integridade. | T6 registra vínculo válido; T9 registra rejeição de unidade inválida. A implementação também bloqueia unidade de outro condomínio. | **Atendido; variante de outro condomínio não está separada como caso de teste** |
| **#3 — Cadastrar área comum com nome, capacidade e horário limite obrigatórios** | Formulário e validação da API exigem nome e horário válido, e capacidade maior que zero; o banco reforça campos obrigatórios e capacidade positiva. | T12 comprova cadastro válido. Não há caso explícito de valor vazio, horário inválido ou capacidade zero/negativa na tabela de testes. | **Implementado; cobertura de teste negativa incompleta** |
| **#3 — Impedir nomes duplicados no condomínio** | Índice único no banco por condomínio e nome, sem distinção entre maiúsculas/minúsculas; duplicidade retorna conflito. | T13 registra rejeição de duplicidade com variação de caixa. | **Atendido** |

### Funcionalidades de suporte ao incremento

Além dos critérios diretamente descritos nas histórias, a aplicação implementa a configuração inicial do condomínio e da primeira conta de síndico, login, carregamento dos dados persistidos, listagem de unidades, moradores e áreas comuns e integração entre frontend, API e PostgreSQL. A configuração inicial de uso único é descrita e consta como cenário T1.

## Requisitos atendidos

- Autenticação de síndico e morador.
- Separação de acesso por perfil e proteção de operações administrativas.
- Senha mínima de 8 caracteres aplicada na criação de credenciais.
- Cadastro de unidade única por bloco/número dentro do condomínio.
- Cadastro de morador com CPF validado e unidade existente do condomínio.
- Cadastro de área comum com os campos previstos, valores válidos e nome único.
- Persistência das operações no PostgreSQL.

## Requisitos parcialmente atendidos

Não há critério funcional marcado como parcialmente implementado no código inspecionado. A parcialidade está na **comprovação por testes**:

- A documentação de testes é manual; não foi encontrado projeto ou suíte automatizada de testes no repositório.
- A evidência atual não apresenta casos específicos para senha abaixo do mínimo, campos obrigatórios ausentes, capacidade inválida ou formato de horário inválido. As validações correspondentes estão no código, mas seria necessário executar e registrar esses casos para comprovar o comportamento.
- O cenário T9 agrupa unidade inexistente e unidade de outro condomínio. A regra de condomínio está implementada, mas a evidência não identifica claramente qual variação foi executada.
- As capturas e o vídeo demonstram a aplicação, mas não estão associados individualmente aos cenários da tabela nem comprovam, por si só, as respostas negativas e a persistência no banco.

## Requisitos não atendidos

**Nenhum requisito funcional das histórias #1–#3 foi identificado como não implementado.**

O termo de aceite do projeto em [`e2b.md`](../../backlog/sprint1/e2b.md) inclui critérios de pronto do MVP mais amplos, como publicação pública, reservas, assistente baseado em regimento e painel de chamados. Esses critérios abrangem o produto como um todo e não são critérios de aceite das três histórias de Sprint 1 no backlog E2A. A falta de deploy público, portanto, não foi classificada como história Sprint 1 não atendida; deve continuar constando como pendência do MVP geral até que o projeto a conclua.

## Funcionalidades implementadas

- Configuração inicial do condomínio e criação do primeiro síndico.
- Login de síndico e morador por e-mail, senha e perfil.
- Controle de acesso às operações de síndico e morador.
- Cadastro e listagem de unidades.
- Cadastro e listagem de moradores associados a unidades.
- Validação de CPF na API e no banco.
- Cadastro e listagem de áreas comuns com capacidade e horário limite.
- Bloqueio de duplicidades de unidade, CPF, e-mail e área comum.
- Persistência dos dados no PostgreSQL e integração com a interface web.

## Problemas e inconsistências encontradas

1. **Escopo incorreto nos documentos E3:** os parágrafos “Escopo da Sprint 1” em [`e3a.md`](../modelagem/e3a.md) e [`e3b.md`](../modelagem/e3b.md) atribuem à Sprint 1 acompanhamento de chamados e consulta do regimento, e tratam áreas comuns como expansão futura. Isso contradiz o backlog E2A, no qual #1–#3 (autenticação, unidades/moradores e áreas comuns) são a Sprint 1, enquanto chamados e assistente pertencem a sprints posteriores.
2. **Modelo de dados de visão ampla versus schema executável:** [`e3c.md`](../modelagem/e3c.md) documenta tabelas e campos de funcionalidades posteriores, enquanto o schema efetivamente inicializado pela API cobre o incremento implementado e não contém todas as estruturas de regimento e gestão avançada de chamados do modelo. Isso não bloqueia as histórias #1–#3, mas o documento deve ser identificado como modelo geral/alvo, não como descrição exata do banco em execução na Sprint 1.
3. **Registros da Sprint 2 em desacordo com o estado atual:** o README e o código atual descrevem e incluem reservas, chamados e assistente; a [ata de retrospectiva da Sprint 2](../sprint2/ata-de-retrospectiva-sprint2.md) registra que essas funcionalidades não foram encontradas na aplicação consultada. A ata pode retratar o estado observado naquela data, mas a documentação atual deve esclarecer a evolução posterior ou atualizar a descrição do estado, sem reescrever o registro histórico.
4. **Dados de cerimônia e board ausentes:** o relatório corretamente não inventa a data/participantes da Sprint Review nem o link, captura ou histórico do board. Se esses dados forem exigidos para avaliação, devem ser acrescentados a partir de fontes reais.
5. **Atribuição individual:** o relatório de contribuição descreve papéis e frentes relacionadas, mas não há commits ou registros individuais anexados que comprovem autoria por pessoa. O documento já deixa essa limitação explícita; não se deve transformar o mapeamento de papéis em atribuição factual sem evidência.

## Documentação a corrigir ou complementar

- Corrigir somente os parágrafos de escopo da Sprint 1 em E3A e E3B para refletir as histórias #1–#3 do backlog; manter chamados, reservas e regimento como escopo futuro quando aplicável.
- Rotular E3C claramente como modelo geral/alvo do sistema ou atualizar a documentação para diferenciar o DER/schema proposto do schema aplicado pela API.
- Acrescentar à evidência de testes os resultados de tentativas com senha inferior a 8 caracteres, campos obrigatórios ausentes, capacidade inválida e horário inválido; separar no T9 os casos de unidade inexistente e unidade fora do condomínio.
- Se disponíveis, inserir no relatório a data e os participantes da Sprint Review, além do board/histórico de status. Se não estiverem disponíveis, as indicações atuais de ausência são corretas.
- Alinhar o README e a ata da Sprint 2 quanto ao estado atual das funcionalidades posteriores, preservando a ata como registro do que foi observado na ocasião.

## Pendências antes do aceite final

1. **Para o escopo funcional da Sprint 1:** não foi encontrada funcionalidade pendente no código relativamente às histórias #1–#3.
2. **Para uma comprovação mais forte:** executar e registrar os casos negativos ainda ausentes na evidência. Isso é uma pendência de verificação, não evidência de que a validação esteja ausente no produto.
3. **Para consistência documental:** corrigir a descrição de escopo em E3A/E3B e distinguir o modelo de dados global do schema aplicado na Sprint 1.
4. **Para encerrar o MVP do projeto:** cumprir os critérios gerais ainda aplicáveis do termo de aceite, incluindo deploy público; isso não deve ser confundido com o aceite das histórias #1–#3.

## Verificações realizadas

- Build executado em 03/10/2026: `dotnet build backend\VivaCondo.Api\VivaCondo.Api.csproj --no-restore` — concluído com **0 avisos e 0 erros**.
- Inspeção do backlog E2A, termo de aceite E2B, documentos E3A/E3B/E3C, relatório de entrega, evidências de teste, retrospectivas, relatório de contribuição, README, frontend, API e schema PostgreSQL.
- Não foram executados novos testes manuais contra um banco/API em execução durante esta análise; os resultados T1–T14 são os registrados no documento de evidências existente.
