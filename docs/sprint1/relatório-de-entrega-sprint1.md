# Relatório de Entrega — Sprint 1 — Sistema Inteligente de Gerenciamento de Condomínios

**Período:** 02/10/2026
**Sprint Review:** 03/10/2026, com o professor Lucas B. F.

## 1. Planejado vs. entregue
| História (E2) | Planejada para esta sprint? | Entregue? | Observação |
|---|---|---|---|
| #1 Autenticação de morador e síndico | Sim | Sim | Login por e-mail e senha, controle de acesso por perfil, senha mínima de 8 caracteres e mensagem para credenciais inválidas. |
| #2 Cadastro de unidades e moradores pelo síndico | Sim | Sim | Unidade única por bloco e número; CPF validado no servidor e no banco; morador vinculado a unidade existente do condomínio. |
| #3 Cadastro de áreas comuns pelo síndico | Sim | Sim | Nome, capacidade máxima e horário limite obrigatórios; duplicidade de nome no condomínio bloqueada. |

## 2. Incremento funcional demonstrável
Aplicação web com API ASP.NET Core .NET 8 e PostgreSQL, executando localmente em `http://localhost:5080`. Permite configurar o condomínio e o primeiro síndico, autenticar síndico e morador, cadastrar unidades, moradores e áreas comuns, com validações e permissões por perfil. Instruções para reproduzir: [`README.md`](../../README.md), seção “Como rodar localmente”. Não há deploy público; a aplicação foi demonstrada localmente. Vídeo de demonstração: [`vivacondo - sprint 1.mp4`](./media/vivacondo%20-%20sprint%201.mp4).

## 3. Backlog atualizado
Backlog priorizado: [`e2a.md`](../../backlog/sprint1/e2a.md). As histórias #1, #2 e #3 estão atribuídas à Sprint 1 e foram implementadas. Link ou captura do board e histórico das mudanças de status dos cards não estão disponíveis nos arquivos do projeto.

## 4. Evidências de teste
Detalhamento dos 14 cenários, resultados e códigos HTTP: [`sprint1-evidencias-testes.md`](./sprint1-evidencias-testes.md). O build da API concluiu com 0 erros e 0 avisos. Os testes foram manuais, executados localmente com API e PostgreSQL; não houve execução em CI nem suíte automatizada. Capturas de tela: [print1](./media/print1.jfif), [print2](./media/print2.jfif) e [print3](./media/print3.jfif).

## 5. Retrospectiva e contribuição individual
- Ata de retrospectiva: [`ata de retrospectiva-sprint1.md`](./ata%20de%20retrospectiva-sprint1.md).
- Relatório de contribuição por integrante: [`sprint1-contirbuicao.md`](./sprint1-contirbuicao.md). Os papéis definidos para a Sprint 1 estão em [`e2b.md`](../../backlog/sprint1/e2b.md). Não foram localizados links para commits, pull requests ou registros individuais de tarefas nos documentos disponíveis.

## 6. Riscos/impedimentos para a próxima sprint
Não foram identificados riscos ou impedimentos registrados para a próxima sprint. Conforme o backlog priorizado, a Sprint 2 tem como alvo as histórias #4 (reservas de áreas comuns), #5 (abertura de chamados) e #6 (assistente virtual com RAG), descritas em [`e2a.md`](../../backlog/sprint1/e2a.md).
