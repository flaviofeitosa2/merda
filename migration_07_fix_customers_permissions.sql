
-- Habilitar RLS se não estiver habilitado
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 1. Política de INSERÇÃO (Permitir que staff adicione clientes)
DROP POLICY IF EXISTS "Staff can insert customers" ON customers;
CREATE POLICY "Staff can insert customers" ON customers
FOR INSERT 
TO authenticated
WITH CHECK (
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid() LIMIT 1)
);

-- 2. Política de ATUALIZAÇÃO (Permitir que staff edite clientes da empresa)
DROP POLICY IF EXISTS "Staff can update customers" ON customers;
CREATE POLICY "Staff can update customers" ON customers
FOR UPDATE
TO authenticated
USING (
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid() LIMIT 1)
)
WITH CHECK (
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid() LIMIT 1)
);

-- 3. Política de EXCLUSÃO
DROP POLICY IF EXISTS "Staff can delete customers" ON customers;
CREATE POLICY "Staff can delete customers" ON customers
FOR DELETE
TO authenticated
USING (
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid() LIMIT 1)
);
