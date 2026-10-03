# Retrospectiva – Sprint 2 – Sistema Inteligente de Gerenciamento de Condomínios

**Data:** 03/10/2026  
**Presentes:** Guilherme Rastelli Fernandes (RA 2840482421047) – Felipe Savegnago Pires (RA 2840482421034) – Marcus Vinicius Milan (RA 2840482421001)

## 1. Ações da retrospectiva anterior

| Ação | Situação | Evidência |
|---|---|---|
| Definir e registrar o limite mensal de reservas. | Aplicada no código e registrada no backlog. | O limite está definido como 2 reservas ativas por unidade/mês. Reservas pendentes e confirmadas contam; canceladas não contam. |
| Implementar reservas e validar conflitos e limite mensal. | Implementada; validação funcional pendente. | A API verifica sobreposição na mesma área/data, limite mensal por unidade e horário limite da área. |
| Implementar abertura de chamados. | Implementada; validação funcional pendente. | A API recebe categoria, localização e descrição, persiste o chamado e define status inicial `ABERTO`. |
| Definir o regimento inicial e validar o assistente. | Implementação disponível; teste com regimento e serviço de IA pendente. | O assistente lê arquivo de texto configurado, seleciona trechos relacionados e tem resposta padrão quando não encontra conteúdo relacionado. |

## 2. O que funcionou bem

- As histórias #4, #5 e #6 têm fluxos na interface e endpoints correspondentes na API.
- A compilação da API foi validada sem erros ou avisos.
- O limite de reservas foi definido e documentado para reduzir ambiguidade no aceite.

## 3. O que precisa melhorar

- Os fluxos com banco de dados ainda precisam de teste funcional em ambiente configurado.
- O assistente ainda precisa ser testado com um arquivo de regimento e uma chave válida da API de IA.
- A interface administrativa e a documentação foram ajustadas para não apresentar o incremento como restrito à Sprint 1.

## 4. Fechamento da Sprint 2

As histórias #4 e #5 estão implementadas no código. A história #6 está implementada para uso com arquivo de texto configurado localmente. A compilação foi aprovada; os testes funcionais das três histórias não estão registrados como executados. Consulte [evidências de validação da Sprint 2](./evidencias-testes-sprint2.md) para os cenários e o estado da validação.
