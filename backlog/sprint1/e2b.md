# Termo de Aceite do Projeto — Sistema Inteligente de Gerenciamento de Condomínios

**Equipe:** Guilherme Rastelli Fernandes 2840482421047, Felipe Savegnago Pires 2840482421034, Marcus Vinicius Milan 2840482421001
**Trilha:** A1
**Data:** 21/08/2026

## 1. Escopo aceito para o semestre (funcionalidades Must + Should)
1. Autenticação e controle de acesso para perfis Morador e Síndico.
2. Cadastro e gestão de unidades, moradores e áreas comuns do condomínio.
3. Agendamento e reserva de áreas comuns com validação automática de conflitos de horário.
4. Abertura e acompanhamento de chamados de manutenção pelos moradores.
5. Assistente virtual de Inteligência Artificial para tirar dúvidas sobre o regimento interno (RAG).
6. Dashboard gerencial do Síndico com consulta agregada do status dos chamados.
7. Upload do documento de regimento interno em PDF para atualização da base da IA.

## 2. Critérios de pronto do MVP
- [ ] Morador consegue fazer perguntas em linguagem natural sobre o regimento e receber respostas coerentes via IA.
- [ ] Sistema impede automaticamente agendamento duplicado para a mesma área comum no mesmo horário.
- [ ] Síndico visualiza o painel com totalizadores de chamados agrupados por categoria e status.
- [ ] Aplicação implantada e acessível publicamente via URL na nuvem.
- [ ] Repositório no GitHub com script DDL e instrução de execução no README.

## 3. Stack tecnológica definida
| Camada | Tecnologia |
|---|---|
| Frontend | HTML5, CSS3, JavaScript / Razor Pages |
| Backend | C# (.NET Core) + API OpenAI |
| Banco de dados | PostgreSQL (ou SQL Server) |
| Deploy | Azure / Render / Railway |

## 4. Papéis iniciais da equipe (Sprint 1)
| Integrante | Papel |
|---|---|
| Guilherme Rastelli Fernandes | Product Owner / AI & Backend Specialist |
| Felipe Savegnago Pires | Backend Developer & Database Lead |
| Marcus Vinicius Milan | Frontend Developer & QA Lead |