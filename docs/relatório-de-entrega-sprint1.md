# Relatório de Entrega — Sprint 1 — Sistema Inteligente de Gerenciamento de Condomínios

**Período:** []
**Sprint Review:** []

## 1. Planejado vs. entregue
| História (E2) | Planejada para esta sprint? | Entregue? | Observação |
|---|---|---|---|
| #1 Autenticação de morador e síndico | Sim | Sim | Login por e-mail e senha, controle de acesso por perfil, senha mínima de 8 caracteres e mensagem para credenciais inválidas. |
| #2 Cadastro de unidades e moradores pelo síndico | Sim | Sim | Unidade única por bloco e número; CPF validado no servidor e no banco; morador vinculado a unidade existente do condomínio. |
| #3 Cadastro de áreas comuns pelo síndico | Sim | Sim | Nome, capacidade máxima e horário limite obrigatórios; duplicidade de nome no condomínio bloqueada. |

## 2. Incremento funcional demonstrável
Aplicação web com API ASP.NET Core .NET 8 e PostgreSQL, executando localmente em `http://localhost:5080`. Permite configurar o condomínio e o primeiro síndico, autenticar síndico e morador, cadastrar unidades, moradores e áreas comuns, com validações e permissões por perfil. Instruções para reproduzir: `README.md`, seção “Como rodar localmente”. Deploy público ou vídeo/GIF de demonstração: [].

## 3. Backlog atualizado
Backlog priorizado: `backlog/e2a.md`. As histórias #1, #2 e #3 estão atribuídas à Sprint 1 e foram implementadas. Link/print do board e registro das mudanças de status dos cards: [].

## 4. Evidências de teste
Build da API concluído sem erros ou avisos. Testes manuais com API e PostgreSQL locais confirmaram login válido e inválido; cadastro de unidade e bloqueio de unidade duplicada; cadastro de morador com CPF válido; rejeição de CPF inválido, CPF duplicado e unidade inexistente; cadastro de área comum e bloqueio de nome duplicado; login do morador e bloqueio de acesso às rotas administrativas. Documento formal de evidências ou execução em CI: [].

## 5. Retrospectiva e contribuição individual
- Ata de retrospectiva: []
- Relatórios individuais de contribuição: []
- Papéis definidos para a Sprint 1 em `backlog/e2b.md`: Guilherme Rastelli Fernandes — Product Owner / AI & Backend Specialist; Felipe Savegnago Pires — Backend Developer & Database Lead; Marcus Vinicius Milan — Frontend Developer & QA Lead. Registros individuais do trabalho realizado: [].

## 6. Riscos/impedimentos para a próxima sprint
Registro formal de riscos ou impedimentos: []. O backlog prioriza para a Sprint 2 as histórias #4 (reservas de áreas comuns), #5 (abertura de chamados) e #6 (assistente virtual com RAG).
