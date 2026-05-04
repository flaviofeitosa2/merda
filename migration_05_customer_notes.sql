
-- Adiciona o campo de observações na tabela de clientes
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;
