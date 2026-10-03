```sql
-- schema.sql â€” Sistema Inteligente de Gerenciamento de CondomÃ­nios
-- PostgreSQL 15+. Executar em banco vazio: psql -f db/schema.sql

CREATE TABLE usuario (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  perfil VARCHAR(20) NOT NULL CHECK (perfil IN ('MORADOR', 'SINDICO'))
);

CREATE TABLE condominio (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  endereco VARCHAR(255) NOT NULL
);

CREATE TABLE unidade (
  id SERIAL PRIMARY KEY,
  condominio_id INT NOT NULL REFERENCES condominio(id),
  bloco VARCHAR(20) NOT NULL,
  numero VARCHAR(20) NOT NULL,
  UNIQUE (condominio_id, bloco, numero)
);

CREATE TABLE morador (
  id INT PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
  cpf VARCHAR(11) NOT NULL UNIQUE,
  unidade_id INT NOT NULL REFERENCES unidade(id),
  CHECK (cpf ~ '^[0-9]{11}$')
);

CREATE TABLE sindico (
  id INT PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
  condominio_id INT NOT NULL REFERENCES condominio(id)
);

CREATE TABLE area_comum (
  id SERIAL PRIMARY KEY,
  condominio_id INT NOT NULL REFERENCES condominio(id),
  nome VARCHAR(100) NOT NULL,
  capacidade_maxima INT NOT NULL CHECK (capacidade_maxima > 0),
  horario_limite_uso TIME NOT NULL,
  UNIQUE (condominio_id, nome)
);

CREATE TABLE reserva (
  id SERIAL PRIMARY KEY,
  morador_id INT NOT NULL REFERENCES morador(id),
  area_comum_id INT NOT NULL REFERENCES area_comum(id),
  data DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (
    status IN ('PENDENTE', 'CONFIRMADA', 'CANCELADA')
  ),
  CHECK (hora_fim > hora_inicio)
);

CREATE TABLE chamado (
  id SERIAL PRIMARY KEY,
  morador_id INT NOT NULL REFERENCES morador(id),
  sindico_id INT REFERENCES sindico(id),
  condominio_id INT NOT NULL REFERENCES condominio(id),
  categoria VARCHAR(100) NOT NULL,
  localizacao VARCHAR(150) NOT NULL,
  descricao TEXT NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (
    status IN ('ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')
  ),
  observacao TEXT,
  justificativa_cancelamento TEXT,
  data_abertura TIMESTAMP NOT NULL,
  CHECK (
    status <> 'CANCELADO'
    OR justificativa_cancelamento IS NOT NULL
  )
);

CREATE TABLE regimento (
  id SERIAL PRIMARY KEY,
  condominio_id INT NOT NULL REFERENCES condominio(id),
  nome_arquivo VARCHAR(255) NOT NULL,
  caminho_arquivo VARCHAR(500) NOT NULL,
  data_atualizacao TIMESTAMP NOT NULL
);

-- Ãndice de apoio Ã  consulta agregada do painel (E2, histÃ³ria #8)
CREATE INDEX idx_chamado_status ON chamado(status);

-- Seed de exemplo
INSERT INTO usuario (nome, email, senha_hash, perfil) VALUES
  ('Carlos Silva', 'carlos.silva@exemplo.com', '$2b$10$exemplo', 'SINDICO'),
  ('Ana Souza', 'ana.souza@exemplo.com', '$2b$10$exemplo', 'MORADOR'),
  ('Joao Santos', 'joao.santos@exemplo.com', '$2b$10$exemplo', 'MORADOR');

INSERT INTO condominio (nome, endereco) VALUES
  ('Residencial Jardim das Flores', 'Rua das Flores, 100');

INSERT INTO unidade (condominio_id, bloco, numero) VALUES
  (1, 'A', '101'),
  (1, 'A', '102');

INSERT INTO sindico (id, condominio_id) VALUES
  (1, 1);

INSERT INTO morador (id, cpf, unidade_id) VALUES
  (2, '12345678901', 1),
  (3, '98765432100', 2);

INSERT INTO area_comum (
  condominio_id,
  nome,
  capacidade_maxima,
  horario_limite_uso
) VALUES
  (1, 'Salao de Festas', 50, '22:00:00'),
  (1, 'Churrasqueira', 20, '21:00:00');

INSERT INTO reserva (
  morador_id,
  area_comum_id,
  data,
  hora_inicio,
  hora_fim,
  status
) VALUES
  (2, 1, '2026-09-20', '18:00:00', '21:00:00', 'CONFIRMADA'),
  (3, 2, '2026-09-25', '15:00:00', '18:00:00', 'PENDENTE');

INSERT INTO chamado (
  morador_id,
  sindico_id,
  condominio_id,
  categoria,
  localizacao,
  descricao,
  status,
  observacao,
  justificativa_cancelamento,
  data_abertura
) VALUES
  (
    2,
    1,
    1,
    'Hidraulica',
    'Apartamento 101',
    'Vazamento na pia da cozinha.',
    'ABERTO',
    NULL,
    NULL,
    '2026-09-05 10:30:00'
  ),
  (
    3,
    1,
    1,
    'Eletrica',
    'Corredor do bloco A',
    'Lampada queimada no corredor.',
    'EM_ANDAMENTO',
    'Manutencao acionada para realizar a troca.',
    NULL,
    '2026-09-04 14:00:00'
  );

INSERT INTO regimento (
  condominio_id,
  nome_arquivo,
  caminho_arquivo,
  data_atualizacao
) VALUES
  (
    1,
    'regimento_interno.pdf',
    '/documentos/regimento_interno.pdf',
    '2026-09-01 09:00:00'
  );
```