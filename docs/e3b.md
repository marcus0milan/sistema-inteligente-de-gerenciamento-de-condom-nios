# DER â€” Sistema Inteligente de Gerenciamento de CondomÃ­nios

## 1. Diagrama

```mermaid
erDiagram
    USUARIO ||--o| MORADOR : "possui perfil"
    USUARIO ||--o| SINDICO : "possui perfil"

    CONDOMINIO ||--o{ UNIDADE : possui
    UNIDADE ||--o{ MORADOR : "vincula"
    
    CONDOMINIO ||--o{ AREA_COMUM : disponibiliza
    MORADOR ||--o{ RESERVA : solicita
    AREA_COMUM ||--o{ RESERVA : recebe

    MORADOR ||--o{ CHAMADO : abre
    SINDICO ||--o{ CHAMADO : gerencia
    CONDOMINIO ||--o{ CHAMADO : possui

    CONDOMINIO ||--o{ REGIMENTO : possui
```

## 2. DicionÃ¡rio de dados

### Tabela: USUARIO
| Campo | Tipo | RestriÃ§Ãµes | DescriÃ§Ã£o |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | Identificador Ãºnico do usuÃ¡rio |
| nome | VARCHAR(100) | NOT NULL | Nome completo do usuÃ¡rio |
| email | VARCHAR(150) | NOT NULL, UNIQUE | E-mail utilizado para autenticaÃ§Ã£o |
| senha_hash | VARCHAR(255) | NOT NULL | Senha armazenada em formato criptografado/hash |
| perfil | ENUM | NOT NULL | Perfil de acesso: MORADOR ou SINDICO |

### Tabela: CONDOMINIO
| Campo | Tipo | RestriÃ§Ãµes | DescriÃ§Ã£o |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | Identificador Ãºnico do condomÃ­nio |
| nome | VARCHAR(150) | NOT NULL | Nome do condomÃ­nio |
| endereco | VARCHAR(255) | NOT NULL | EndereÃ§o do condomÃ­nio |

### Tabela: UNIDADE
| Campo | Tipo | RestriÃ§Ãµes | DescriÃ§Ã£o |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | Identificador Ãºnico da unidade |
| condominio_id | INT | FK, NOT NULL | CondomÃ­nio ao qual a unidade pertence |
| bloco | VARCHAR(20) | NOT NULL | IdentificaÃ§Ã£o do bloco |
| numero | VARCHAR(20) | NOT NULL | NÃºmero da unidade |

### Tabela: MORADOR
| Campo | Tipo | RestriÃ§Ãµes | DescriÃ§Ã£o |
|---|---|---|---|
| id | INT | PK, FK | Identificador relacionado ao usuÃ¡rio |
| cpf | VARCHAR(11) | NOT NULL, UNIQUE | CPF do morador |
| unidade_id | INT | FK, NOT NULL | Unidade Ã  qual o morador estÃ¡ vinculado |

### Tabela: SINDICO
| Campo | Tipo | RestriÃ§Ãµes | DescriÃ§Ã£o |
|---|---|---|---|
| id | INT | PK, FK | Identificador relacionado ao usuÃ¡rio |
| condominio_id | INT | FK, NOT NULL | CondomÃ­nio administrado pelo sÃ­ndico |

### Tabela: AREA_COMUM
| Campo | Tipo | RestriÃ§Ãµes | DescriÃ§Ã£o |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | Identificador Ãºnico da Ã¡rea comum |
| condominio_id | INT | FK, NOT NULL | CondomÃ­nio ao qual a Ã¡rea pertence |
| nome | VARCHAR(100) | NOT NULL | Nome da Ã¡rea comum |
| capacidade_maxima | INT | NOT NULL | Capacidade mÃ¡xima de pessoas |
| horario_limite_uso | TIME | NOT NULL | HorÃ¡rio limite permitido para utilizaÃ§Ã£o |

### Tabela: RESERVA
| Campo | Tipo | RestriÃ§Ãµes | DescriÃ§Ã£o |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | Identificador Ãºnico da reserva |
| morador_id | INT | FK, NOT NULL | Morador que solicitou a reserva |
| area_comum_id | INT | FK, NOT NULL | Ãrea comum reservada |
| data | DATE | NOT NULL | Data da reserva |
| hora_inicio | TIME | NOT NULL | HorÃ¡rio inicial da reserva |
| hora_fim | TIME | NOT NULL | HorÃ¡rio final da reserva |
| status | ENUM | NOT NULL | Status da reserva |

### Tabela: CHAMADO
| Campo | Tipo | RestriÃ§Ãµes | DescriÃ§Ã£o |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | Identificador Ãºnico do chamado |
| morador_id | INT | FK, NOT NULL | Morador que abriu o chamado |
| sindico_id | INT | FK, NULL | SÃ­ndico responsÃ¡vel pelo chamado |
| condominio_id | INT | FK, NOT NULL | CondomÃ­nio relacionado ao chamado |
| categoria | VARCHAR(100) | NOT NULL | Categoria do problema |
| localizacao | VARCHAR(150) | NOT NULL | Local onde o problema foi identificado |
| descricao | TEXT | NOT NULL | DescriÃ§Ã£o do problema |
| status | ENUM | NOT NULL | Status atual do chamado |
| observacao | TEXT | NULL | ObservaÃ§Ãµes adicionadas pelo sÃ­ndico |
| justificativa_cancelamento | TEXT | NULL | Justificativa obrigatÃ³ria quando cancelado |
| data_abertura | DATETIME | NOT NULL | Data e hora de abertura |

### Tabela: REGIMENTO
| Campo | Tipo | RestriÃ§Ãµes | DescriÃ§Ã£o |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | Identificador Ãºnico do regimento |
| condominio_id | INT | FK, NOT NULL | CondomÃ­nio ao qual o regimento pertence |
| nome_arquivo | VARCHAR(255) | NOT NULL | Nome do arquivo PDF |
| caminho_arquivo | VARCHAR(500) | NOT NULL | LocalizaÃ§Ã£o do arquivo armazenado |
| data_atualizacao | DATETIME | NOT NULL | Data da Ãºltima atualizaÃ§Ã£o |