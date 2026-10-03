# Sistema Inteligente de Gerenciamento de Condomínios

Sistema de gestão condominial integrado à Inteligência Artificial, com módulos de controle financeiro, logístico e de segurança. Utiliza um assistente virtual (via API da OpenAI) para interpretar o regimento interno e responder dúvidas dos moradores em tempo real, além de análise de sentimentos para identificar problemas recorrentes e um protótipo de monitoramento de acesso para segurança preditiva.

**Deploy:** ainda não publicado — previsto para Semana X
**Equipe:** Guilherme Rastelli (2840482421047) · Felipe Savegnago (2840482421034) · Marcus Milan (2840482421001) · Laboratório de Engenharia de Software · ADS Fatec Ribeirão Preto

## Stack
- Frontend atual: HTML, CSS e JavaScript, sem dependências ou etapa de build
- Backend planejado: C# com .NET 8
- Banco de dados: PostgreSQL 15 foi usado para validar o DDL da E3; formalizar a decisão final da stack com a equipe
- Integração de IA planejada: API da OpenAI

## Primeiro incremento
O painel inicial apresenta um resumo do condomínio e permite registrar ocorrências, pesquisar e filtrar chamados e atualizar seus status. Os registros ficam salvos no `localStorage` do navegador.

Os dados de moradores, acessos, unidades e financeiro são demonstrativos. Ainda não há backend, autenticação, banco de dados, integração com dispositivos de acesso ou conexão com a OpenAI.

## Como rodar localmente
1. Abra `frontend/index.html` diretamente em um navegador atualizado.
2. Acesse **Ocorrências** para registrar chamados e alterar seus status.

Não é necessário instalar dependências ou iniciar um servidor. Limpar os dados do site no navegador restaura os dados demonstrativos iniciais.

## Estrutura do repositório
```
/frontend       — interface web estática e lógica do primeiro incremento
/src            — reservado para a futura API e lógica de negócios
/docs           — documentação do projeto
```

## Convenções da equipe
- Branches: `feature/nome-da-feature`
- Commits: Conventional Commits
- Toda PR exige revisão de ao menos 1 integrante antes do merge.

## Testes
O protótipo atual foi validado manualmente no navegador para cadastro, busca, atualização de status e priorização local de ocorrências. Ainda não há API para testes via Swagger nem testes automatizados xUnit; esses testes entram com o backend.

## Licença / Uso acadêmico
Projeto desenvolvido para a disciplina de Laboratório de Engenharia de Software — ADS, Fatec Ribeirão Preto, 2026.
