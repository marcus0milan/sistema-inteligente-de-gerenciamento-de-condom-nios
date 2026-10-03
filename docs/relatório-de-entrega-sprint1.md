# Relatório de Entrega — Sprint 1 — EstágioFatec

**Período:** 18/09/2026 (Sprint 1 comprimida em 1 semana só)
**Sprint Review:** 18/09/2026, com o professor Lucas B. F.

## 1. Planejado vs. entregue
| História (E2) | Planejada para esta sprint? | Entregue? | Observação |
|---|---|---|---|
| #1 Cadastro/login | Sim | Sim | — |
| #2 Cadastro de empresa | Sim | Sim | — |
| #3 Cadastro de convênio | Sim | Sim | — |
| #4 Publicação de vaga | Sim | Parcial | Falta validação de convênio vigente; movida para Sprint 2 |

## 2. Incremento funcional demonstrável
Login com 2 perfis, CRUD de empresa e convênio funcionando com validação de CNPJ e datas.
Ambiente rodando localmente (deploy público só a partir da E4/E9). Vídeo de 2 min da
demonstração: `docs/sprints/sprint-1-demo.mp4`. Passo a passo para reproduzir: ver README
na raiz do repositório.

## 3. Backlog atualizado
Board: https://github.com/orgs/equipe-estagiofatec/projects/1 — ao fim da sprint, 3 cards
moveram de "A fazer" para "Concluído", 1 card (#4) ficou em "Em andamento" e foi replanejado
para a Sprint 2.

## 4. Evidências de teste
6 testes unitários e 2 de integração adicionados nesta sprint, todos passando em CI. Detalhe
completo: `docs/sprints/sprint-1-evidencias-teste.md`.

## 5. Retrospectiva e contribuição individual
- Ata de retrospectiva: `docs/sprints/sprint-1-retrospectiva.md`
- Relatórios individuais (com nome + RA de cada um): `docs/sprints/sprint-1-contribuicao-{ana,bruno,carla,diego}.md`

## 6. Riscos/impedimentos para a próxima sprint
Validação de convênio vigente na criação de vaga ficou mais complexa que o previsto (regra de
data cruzada com N:N de cursos) — replanejada como primeira tarefa da Sprint 2, com Diego
assumindo por já ter modelado essa parte no DER.