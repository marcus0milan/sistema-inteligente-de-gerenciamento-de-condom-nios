# Sistema Inteligente de Gerenciamento de Condomínios

Projeto de gestão condominial com módulos planejados de controle financeiro, logístico e de segurança. A integração com assistente virtual via API da OpenAI, análise de sentimentos e monitoramento de acesso ainda não foi implementada.

**Deploy:** ainda não publicado — previsto para Semana X
**Equipe:** Guilherme Rastelli (2840482421047) · Felipe Savegnago (2840482421034) · Marcus Milan (2840482421001) · Laboratório de Engenharia de Software · ADS Fatec Ribeirão Preto

## Stack
- Frontend atual: HTML, CSS e JavaScript, sem dependências ou etapa de build
- Backend planejado: C# com .NET 8
- Banco de dados: PostgreSQL 15 foi usado para validar o DDL da E3; formalizar a decisão final da stack com a equipe
- Integração de IA planejada: API da OpenAI

## Incremento da Sprint 1
O frontend permite configurar o condomínio e o primeiro acesso de síndico, entrar como síndico ou morador, cadastrar unidades e moradores vinculados e cadastrar áreas comuns. O protótipo valida senha mínima de 8 caracteres, CPF, vínculo a uma unidade existente, duplicidade de bloco/número e duplicidade de nome de área.

**Limitação importante:** este incremento é um protótipo de frontend sem backend. Os dados são mantidos no `localStorage` deste navegador e a autenticação não oferece segurança de produção; não use credenciais nem dados pessoais reais. A integração com API e PostgreSQL, com autorização validada no servidor, continua necessária para considerar essas funcionalidades prontas para uso real.

## Como rodar localmente
1. Sirva a pasta `frontend` em `localhost` ou abra `frontend/index.html` em um navegador atualizado com suporte a Web Crypto.
2. No primeiro acesso, informe os dados do condomínio e crie a conta demonstrativa de síndico.
3. Entre com essa conta para cadastrar unidades, moradores e áreas comuns. A senha inicial do morador permite demonstrar o acesso com o perfil **Morador**.

Não é necessário instalar dependências ou compilar o frontend. Limpar os dados do site no navegador apaga os cadastros locais e reinicia o protótipo.

## Estrutura do repositório
```
/frontend       — interface e lógica local do protótipo da Sprint 1
/src            — reservado para a futura API e lógica de negócios
/docs           — documentação do projeto
```

## Convenções da equipe
- Branches: `feature/nome-da-feature`
- Commits: Conventional Commits
- Toda PR exige revisão de ao menos 1 integrante antes do merge.

## Testes
O frontend da Sprint 1 deve ser validado manualmente para configuração inicial, login por perfil, credenciais inválidas, cadastro e duplicidade de unidades/áreas, validação de CPF e vínculo obrigatório do morador com unidade existente. Ainda não há backend/API, testes automatizados ou autenticação segura de produção.

## Licença / Uso acadêmico
Projeto desenvolvido para a disciplina de Laboratório de Engenharia de Software — ADS, Fatec Ribeirão Preto, 2026.
