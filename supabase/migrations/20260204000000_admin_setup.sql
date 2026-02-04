-- 1. Add role column to profiles if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));
    END IF;
END $$;

-- 2. Create admin_settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Insert default settings
INSERT INTO public.admin_settings (key, value) VALUES 
('nowpayments_api_key', '{"value": ""}'),
('security_settings', '{"ip_whitelist": [], "two_factor_enabled": false}'),
('system_notifications', '{"email_notifications": true, "push_notifications": true}')
ON CONFLICT (key) DO NOTHING;

-- 4. Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can do everything on admin_settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can view activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;

-- 7. Admin policies
CREATE POLICY "Admins can do everything on admin_settings"
ON public.admin_settings FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can view activity_logs"
ON public.activity_logs FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can view all transactions"
ON public.transactions FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 8. Withdrawal policies (Conditional check for table existence)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'crypto_withdrawals') THEN
        DROP POLICY IF EXISTS "Admins can view all withdrawals" ON public.crypto_withdrawals;
        DROP POLICY IF EXISTS "Admins can update withdrawals" ON public.crypto_withdrawals;
        
        CREATE POLICY "Admins can view all withdrawals"
        ON public.crypto_withdrawals FOR SELECT
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

        CREATE POLICY "Admins can update withdrawals"
        ON public.crypto_withdrawals FOR UPDATE
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;
END $$;
