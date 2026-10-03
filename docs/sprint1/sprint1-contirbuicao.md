# Contribuição da Equipe — Sprint 1

Este documento organiza por integrante as responsabilidades e frentes relacionadas ao incremento da Sprint 1. Os papéis foram consultados no termo de aceite em [`backlog/sprint1/e2b.md`](../../backlog/sprint1/e2b.md), e as funcionalidades entregues foram conferidas no [relatório de entrega](./relatório-de-entrega-sprint1.md) e nas [evidências de teste](./sprint1-evidencias-testes.md).

## Guilherme Rastelli Fernandes — Product Owner / AI & Backend Specialist

**Responsabilidade definida:** Product Owner e especialista em IA e backend.

**Frentes da Sprint 1 relacionadas ao papel:**
- acompanhar o objetivo do produto e o recorte das histórias priorizadas para a sprint;
- contribuir na compreensão dos critérios de aceite de autenticação, cadastros e regras de acesso;
- frente técnica de backend prevista no papel, relacionada à API ASP.NET Core e à comunicação com PostgreSQL.

**Resultado do incremento relacionado:** as histórias priorizadas #1, #2 e #3 foram implementadas na aplicação integrada, conforme descrito no [relatório de entrega](./relatório-de-entrega-sprint1.md).

## Felipe Savegnago Pires — Backend Developer & Database Lead

**Responsabilidade definida:** desenvolvimento do backend e liderança do banco de dados.

**Frentes da Sprint 1 relacionadas ao papel:**
- API para autenticação e controle de acesso por perfil;
- operações de cadastro e consulta de unidades, moradores e áreas comuns;
- persistência PostgreSQL e regras de integridade para duplicidade, CPF e vínculo do morador à unidade.

**Resultado do incremento relacionado:** API ASP.NET Core .NET 8 integrada ao PostgreSQL para as três histórias da sprint; validações e resultados dos testes estão listados nas [evidências](./sprint1-evidencias-testes.md).

## Marcus Vinicius Milan — Frontend Developer & QA Lead

**Responsabilidade definida:** desenvolvimento do frontend e liderança de QA.

**Frentes da Sprint 1 relacionadas ao papel:**
- interface de configuração inicial do condomínio e acesso de síndico;
- telas de login por perfil, cadastro de unidades e moradores e cadastro de áreas comuns;
- validação visual dos fluxos e execução de testes manuais de aceitação com a API e o PostgreSQL.

**Resultado do incremento relacionado:** frontend conectado à API para os fluxos implementados; testes manuais de login, permissões, cadastros, CPF e duplicidades documentados nas [evidências](./sprint1-evidencias-testes.md).

## Registro individual

Links para commits, pull requests, tarefas atribuídas individualmente ou confirmação dos integrantes: [].
