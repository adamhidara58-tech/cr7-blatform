
-- Drop all existing SELECT policies on crypto_withdrawals
DROP POLICY IF EXISTS "Admin can view all withdrawals" ON public.crypto_withdrawals;
DROP POLICY IF EXISTS "Users can view their own withdrawals" ON public.crypto_withdrawals;
DROP POLICY IF EXISTS "Admin can update withdrawals" ON public.crypto_withdrawals;
DROP POLICY IF EXISTS "Users can create their own withdrawals" ON public.crypto_withdrawals;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Admin can view all withdrawals"
ON public.crypto_withdrawals
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own withdrawals"
ON public.crypto_withdrawals
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admin can update withdrawals"
ON public.crypto_withdrawals
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own withdrawals"
ON public.crypto_withdrawals
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Also fix profiles SELECT policies for admin to see usernames
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Also fix profiles UPDATE for admin
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
CREATE POLICY "Admin can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
