# Relatório de Entrega — Sprint 2 — Sistema Inteligente de Gerenciamento de Condomínios

**Período:** 03/10/2026
**Sprint Review:** 03/10/2026

## 1. Planejado vs. entregue
| História (E2) | Planejada para esta sprint? | Entregue? | Observação |
|---|---|---|---|
| #4 Solicitação de reserva de área comum | Sim | Sim | A API verifica sobreposição de horários na mesma área e data, limite de 2 reservas ativas por unidade/mês e horário limite da área. Validação funcional pendente. |
| #5 Abertura de chamado de manutenção | Sim | Sim | O fluxo recebe categoria, localização e descrição e define o status inicial como `ABERTO`. Validação funcional pendente. |
| #6 Assistente virtual sobre o regimento | Sim | Sim | O assistente usa arquivo de texto configurado localmente, recupera trechos relacionados e possui resposta padrão quando não encontra informação. Teste com regimento e serviço de IA pendente. |

## 2. Incremento funcional demonstrável
Aplicação web com API ASP.NET Core .NET 8 e PostgreSQL. O incremento da Sprint 2 inclui solicitação de reservas, abertura de chamados e consulta ao assistente com base em um arquivo de regimento configurado localmente. Não há deploy público; a aplicação pode ser executada localmente. Instruções para reproduzir: [`README.md`](../../README.md), seção “Como rodar localmente”. Vídeo da apresentação: [`apresentação sprint2.mp4`](./media/apresenta%C3%A7%C3%A3o%20sprint2.mp4).

## 3. Backlog atualizado
Backlog priorizado: [`e2a.md`](../../backlog/sprint1/e2a.md). As histórias #4, #5 e #6 estão atribuídas à Sprint 2 e implementadas no código. Link ou captura do board e histórico das mudanças de status dos cards não estão disponíveis nos arquivos do projeto.

## 4. Evidências de teste
Detalhamento dos cenários e resultados: [`sprint2-evidencias teste.md`](./sprint2-evidencias%20teste.md). O build da API foi aprovado, com 0 erros e 0 avisos. Os testes funcionais de reservas e chamados com PostgreSQL e do assistente com arquivo de regimento e chave válida da API de IA não foram executados neste ambiente.

## 5. Retrospectiva e contribuição individual
- Ata de retrospectiva: [`sprint2-ata de retrospectiva.md`](./sprint2-ata%20de%20retrospectiva.md).
- Relatório de contribuição por integrante: [`sprint2-contribuicao.md`](./sprint2-contribuicao.md). Não foram localizados links para commits, pull requests ou registros individuais de tarefas nos documentos disponíveis.

## 6. Riscos/impedimentos para a próxima sprint
Os testes funcionais das histórias #4, #5 e #6 ainda precisam ser executados em ambiente configurado; para o assistente, também é necessário fornecer arquivo de regimento e chave válida da API de IA. A Sprint 3 tem como alvo as histórias #7 a #10 do backlog, incluindo gerenciamento de chamados, painel, upload do regimento e histórico de solicitações.
