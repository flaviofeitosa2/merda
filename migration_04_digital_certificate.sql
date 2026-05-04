
-- 1. Adiciona a coluna na tabela de clientes
ALTER TABLE customers ADD COLUMN IF NOT EXISTS digital_certificate_url TEXT;

-- 2. Limpar políticas antigas do bucket para evitar conflitos
DROP POLICY IF EXISTS "Admins can do everything in certificates" ON storage.objects;
DROP POLICY IF EXISTS "Customers can download their own certificate" ON storage.objects;

-- 3. POLÍTICA PARA ADMINS (Upload, Download, Delete)
CREATE POLICY "Admins can do everything in certificates"
ON storage.objects 
FOR ALL 
TO authenticated
USING ( bucket_id = 'certificates' )
WITH CHECK ( bucket_id = 'certificates' );

-- 4. POLÍTICA PARA O CLIENTE (Apenas leitura do próprio arquivo)
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
  )
);
