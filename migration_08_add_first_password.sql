
-- Adiciona a coluna first_password na tabela de clientes
ALTER TABLE customers ADD COLUMN IF NOT EXISTS first_password TEXT;
