
DROP POLICY IF EXISTS "Allow reading admin settings" ON public.admin_settings;
CREATE POLICY "Authenticated users can read settings" 
ON public.admin_settings FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);
