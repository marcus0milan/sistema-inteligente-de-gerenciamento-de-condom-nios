CREATE OR REPLACE FUNCTION cpf_valido(valor TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
STRICT
AS $$
DECLARE
  digitos TEXT := regexp_replace(valor, '\D', '', 'g');
  soma INTEGER;
  resto INTEGER;
  esperado INTEGER;
  indice INTEGER;
  etapa INTEGER;
BEGIN
  IF digitos !~ '^[0-9]{11}$' OR digitos ~ '^([0-9])\1{10}$' THEN
    RETURN FALSE;
  END IF;

  FOR etapa IN 1..2 LOOP
    soma := 0;
    FOR indice IN 1..(8 + etapa) LOOP
      soma := soma + substring(digitos, indice, 1)::INTEGER * (10 + etapa - indice);
    END LOOP;
    resto := (soma * 10) % 11;
    esperado := CASE WHEN resto = 10 THEN 0 ELSE resto END;
    IF substring(digitos, 9 + etapa, 1)::INTEGER <> esperado THEN
      RETURN FALSE;
    END IF;
  END LOOP;

  RETURN TRUE;
END;
$$;

CREATE TABLE IF NOT EXISTS condominio (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  endereco VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS usuario (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  perfil VARCHAR(20) NOT NULL CHECK (perfil IN ('MORADOR', 'SINDICO'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuario_email_ci ON usuario (lower(email));

CREATE TABLE IF NOT EXISTS unidade (
  id SERIAL PRIMARY KEY,
  condominio_id INT NOT NULL REFERENCES condominio(id),
  bloco VARCHAR(20) NOT NULL,
  numero VARCHAR(20) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unidade_condominio_bloco_numero_ci
  ON unidade (condominio_id, lower(bloco), lower(numero));

CREATE TABLE IF NOT EXISTS sindico (
  id INT PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
  condominio_id INT NOT NULL REFERENCES condominio(id)
);

CREATE TABLE IF NOT EXISTS morador (
  id INT PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
  cpf VARCHAR(11) NOT NULL UNIQUE CHECK (cpf_valido(cpf)),
  unidade_id INT NOT NULL REFERENCES unidade(id)
);

CREATE TABLE IF NOT EXISTS area_comum (
  id SERIAL PRIMARY KEY,
  condominio_id INT NOT NULL REFERENCES condominio(id),
  nome VARCHAR(100) NOT NULL,
  capacidade_maxima INT NOT NULL CHECK (capacidade_maxima > 0),
  horario_limite_uso TIME NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_area_comum_condominio_nome_ci
  ON area_comum (condominio_id, lower(nome));

CREATE TABLE IF NOT EXISTS reserva (
  id SERIAL PRIMARY KEY,
  morador_id INT NOT NULL REFERENCES morador(id),
  area_comum_id INT NOT NULL REFERENCES area_comum(id),
  data DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE'
    CHECK (status IN ('PENDENTE', 'CONFIRMADA', 'CANCELADA')),
  CHECK (hora_fim > hora_inicio)
);

CREATE INDEX IF NOT EXISTS idx_reserva_area_data_status
  ON reserva (area_comum_id, data, status);
CREATE INDEX IF NOT EXISTS idx_reserva_morador_data_status
  ON reserva (morador_id, data, status);

CREATE TABLE IF NOT EXISTS chamado (
  id SERIAL PRIMARY KEY,
  morador_id INT NOT NULL REFERENCES morador(id),
  condominio_id INT NOT NULL REFERENCES condominio(id),
  categoria VARCHAR(100) NOT NULL,
  localizacao VARCHAR(150) NOT NULL,
  descricao TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ABERTO'
    CHECK (status IN ('ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')),
  data_abertura TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chamado_morador_data
  ON chamado (morador_id, data_abertura DESC);
