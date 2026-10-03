# Contribuição da Equipe — Sprint 2

Este documento organiza por integrante as responsabilidades e frentes relacionadas ao incremento da Sprint 2. As frentes foram consultadas nas ações para a próxima sprint registradas na [retrospectiva da Sprint 1](../sprint1/sprint1-ata-de-retrospectiva.md). O estado do incremento e da validação foi conferido na [retrospectiva da Sprint 2](./sprint2-ata%20de%20retrospectiva.md) e nas [evidências de teste](./sprint2-evidencias%20teste.md).

## Guilherme Rastelli Fernandes — Product Owner / AI & Backend Specialist

**Responsabilidade definida:** Product Owner e especialista em IA e backend, conforme o termo de aceite do projeto.

**Frentes da Sprint 2 relacionadas ao papel:**
- definir e registrar o limite mensal de reservas por unidade;
- definir o regimento usado como fonte inicial do assistente;
- validar o assistente com perguntas respondidas pelo documento e perguntas sem resposta nele.

**Resultado do incremento relacionado:** o limite está definido como 2 reservas ativas por unidade/mês e registrado no backlog. O assistente usa um arquivo de texto configurado localmente; o teste funcional com regimento e serviço de IA permanece pendente, conforme as [evidências](./sprint2-evidencias%20teste.md).

## Felipe Savegnago Pires — Backend Developer & Database Lead

**Responsabilidade definida:** desenvolvimento do backend e liderança do banco de dados, conforme o termo de aceite do projeto.

**Frentes da Sprint 2 relacionadas ao papel:**
- implementar solicitações de reserva;
- validar sobreposição de horários e limite mensal de reservas ativas.

**Resultado do incremento relacionado:** a API contém validação de conflitos, limite mensal por unidade e horário limite da área. Os testes funcionais com PostgreSQL ainda não estão registrados como executados.

## Marcus Vinicius Milan — Frontend Developer & QA Lead

**Responsabilidade definida:** desenvolvimento do frontend e liderança de QA, conforme o termo de aceite do projeto.

**Frentes da Sprint 2 relacionadas ao papel:**
- implementar a abertura de chamados com categoria, localização, descrição e status inicial “Aberto”;
- testar o fluxo de abertura de chamado pelo morador.

**Resultado do incremento relacionado:** o fluxo de abertura de chamados está disponível na interface e na API, com status inicial `ABERTO`. A validação funcional com banco de dados ainda está pendente.

## Registro individual

As frentes acima reproduzem as responsabilidades registradas na retrospectiva da Sprint 1 e relacionam essas frentes ao incremento atual. Não foram localizados registros individuais de commits, pull requests ou tarefas concluídas; portanto, este documento não atribui a implementação ou os testes a uma pessoa específica.
