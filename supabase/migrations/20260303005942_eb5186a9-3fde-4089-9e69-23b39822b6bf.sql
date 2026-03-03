
-- Function to check if user has any admin-level role
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin', 'staff')
  )
$$;

-- Function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'moderator' THEN 3
      WHEN 'staff' THEN 4
      WHEN 'user' THEN 5
    END
  LIMIT 1
$$;

-- Upgrade existing admin to super_admin
UPDATE public.user_roles 
SET role = 'super_admin' 
WHERE user_id = '83a75633-aa49-4a56-a11c-93b9eb049844' AND role = 'admin';

-- Update RLS policies

DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles" ON public.profiles
FOR SELECT USING (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
CREATE POLICY "Admin can update all profiles" ON public.profiles
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Admin can view all withdrawals" ON public.crypto_withdrawals;
CREATE POLICY "Admin can view all withdrawals" ON public.crypto_withdrawals
FOR SELECT USING (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admin can update withdrawals" ON public.crypto_withdrawals;
CREATE POLICY "Admin can update withdrawals" ON public.crypto_withdrawals
FOR UPDATE USING (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admin can view all activity logs" ON public.activity_logs;
CREATE POLICY "Admin can view all activity logs" ON public.activity_logs
FOR SELECT USING (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Super admin can manage roles" ON public.user_roles;
CREATE POLICY "Super admin can manage roles" ON public.user_roles
FOR ALL USING (has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Admin can insert admin settings" ON public.admin_settings;
CREATE POLICY "Admin can insert admin settings" ON public.admin_settings
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Admin can update admin settings" ON public.admin_settings;
CREATE POLICY "Admin can update admin settings" ON public.admin_settings
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin')
);

-- Admin can view all commissions
DROP POLICY IF EXISTS "Admin can view all commissions" ON public.referral_commissions;
CREATE POLICY "Admin can view all commissions" ON public.referral_commissions
FOR SELECT USING (is_admin_user(auth.uid()));
