# Ata de Retrospectiva – Sprint 1 – Sistema Inteligente de Gerenciamento de Condomínios

**Data:** 02/10/2026  
**Presentes:** Guilherme Rastelli Fernandes (RA 2840482421047) – Felipe Savegnago Pires (RA 2840482421034) – Marcus Vinicius Milan (RA 2840482421001)

## 1. Ações da retrospectiva anterior – foram aplicadas?

Como esta foi a primeira retrospectiva do projeto, não havia ações anteriores.

| Ação decidida | Aplicada? | Evidência/comentário |
|---|---|---|
| Não se aplica | Não se aplica | Primeira retrospectiva do projeto. |

## 2. O que funcionou bem

- A equipe concluiu o escopo planejado da Sprint 1: autenticação, cadastro de unidades e moradores e cadastro de áreas comuns.
- A integração entre a interface, a API e o banco de dados permitiu persistir os cadastros e validar os dados.
- As permissões por perfil ajudaram a separar as operações de síndico e morador.

## 3. O que não funcionou

- Foi necessário conferir as validações em mais de uma camada (interface, API e banco), o que exigiu atenção durante a integração.
- As funcionalidades de reserva, chamados e assistente virtual ainda não estão implementadas e precisam ser desenvolvidas nas próximas sprints.

## 4. Ações para a próxima sprint

| Ação | Responsável |
|---|---|
| Definir e registrar o limite mensal de reservas antes de implementar a história #4. | Guilherme Rastelli Fernandes |
| Implementar reservas e validar conflitos de horário e limite mensal. | Felipe Savegnago Pires |
| Implementar a abertura de chamados e testar o fluxo de morador. | Marcus Vinicius Milan |
| Definir o regimento que será usado como fonte inicial do assistente RAG e validar respostas com perguntas de teste. | Guilherme Rastelli Fernandes |