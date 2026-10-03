# Evidências de Validação – Sprint 2

## Escopo

Este registro cobre somente as histórias #4, #5 e #6 do [backlog priorizado](../../backlog/sprint1/e2a.md).

## Verificação executada

| Verificação | Resultado |
|---|---|
| `dotnet build backend\VivaCondo.Api\VivaCondo.Api.csproj` | Aprovado: compilação concluída com 0 erros e 0 avisos. |
| Testes funcionais de reservas e chamados com PostgreSQL | Não executados neste ambiente: o serviço PostgreSQL está ativo, mas a conexão local exige senha e não há `ConnectionStrings__Default` configurada. |
| Testes funcionais do assistente | Não executados neste ambiente: `OPENAI_API_KEY` e `REGIMENTO_PATH` não estão configurados. |

## Cenários funcionais para aceite

Executar com a API e um banco de desenvolvimento configurados. Para o assistente, configurar também um arquivo de texto de teste e uma chave válida.

| História | Cenário | Resultado esperado | Situação |
|---|---|---|---|
| #4 | Solicitar reserva em horário disponível, dentro do limite mensal e antes do horário limite da área. | Reserva criada com status `PENDENTE`. | Pendente |
| #4 | Solicitar horário sobreposto para a mesma área e data. | Solicitação rejeitada; nenhuma reserva duplicada criada. | Pendente |
| #4 | Atingir duas reservas `PENDENTE`/`CONFIRMADA` da unidade no mês e solicitar outra. | Solicitação rejeitada pelo limite de 2 reservas ativas. | Pendente |
| #5 | Abrir chamado preenchendo categoria, localização e descrição. | Chamado persistido com status inicial `ABERTO`. | Pendente |
| #5 | Enviar chamado com campo obrigatório vazio. | Solicitação rejeitada com erro de validação; nenhum chamado incompleto criado. | Pendente |
| #6 | Perguntar algo respondido pelo texto do regimento. | Resposta baseada nos trechos recuperados do documento. | Pendente |
| #6 | Perguntar algo que não consta no texto do regimento. | Mensagem padrão informando que a informação não foi encontrada. | Pendente |

Os cenários acima não são declarados como aprovados até serem executados e seus resultados registrados. Este registro limita-se ao escopo da Sprint 2.
