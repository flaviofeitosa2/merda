
-- Habilitar RLS nas tabelas críticas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 1. POLÍTICAS PARA PERFIL (PROFILES)
-- Usuário pode ver seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

-- 2. POLÍTICAS PARA CLIENTES (CUSTOMERS)
-- Clientes só podem ver seu próprio registro de cliente
CREATE POLICY "Customers view own data" ON customers
FOR SELECT
TO authenticated
USING (
  id = (SELECT customer_id FROM profiles WHERE id = auth.uid() LIMIT 1)
  OR
  -- Permitir que admins/staff vejam clientes da sua empresa
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid() LIMIT 1)
);

-- 3. POLÍTICAS PARA VENDAS/FATURAS (SALES)
-- Clientes só veem vendas vinculadas ao seu ID
CREATE POLICY "Customers view own sales" ON sales
FOR SELECT
TO authenticated
USING (
  customer_id = (SELECT customer_id FROM profiles WHERE id = auth.uid() LIMIT 1)
  OR
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'operator', 'master') LIMIT 1)
);

-- 4. POLÍTICAS PARA ASSINATURAS (SUBSCRIPTIONS)
-- Clientes só veem suas assinaturas
CREATE POLICY "Customers view own subscriptions" ON subscriptions
FOR SELECT
TO authenticated
USING (
  customer_id = (SELECT customer_id FROM profiles WHERE id = auth.uid() LIMIT 1)
  OR
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'operator', 'master') LIMIT 1)
);

-- 5. REFORÇO NO STORAGE (CERTIFICADOS)
-- Garante que o cliente só baixe arquivos da pasta com seu ID
DROP POLICY IF EXISTS "Customers can download their own certificate" ON storage.objects;
CREATE POLICY "Customers can download their own certificate"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'certificates' 
  AND (storage.foldername(name))[1] = (
    SELECT customer_id::text 
    FROM profiles 
    WHERE id = auth.uid() 
    LIMIT 1
  )
);
