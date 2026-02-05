-- Create admin_settings table for storing withdrawal limits and other settings
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity_logs table for admin action tracking
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Admin settings: Allow read for all authenticated users
CREATE POLICY "Allow reading admin settings" 
ON public.admin_settings 
FOR SELECT 
USING (true);

-- Activity logs: Allow insert from authenticated users and read for admins
CREATE POLICY "Allow reading activity logs for authenticated users" 
ON public.activity_logs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow inserting activity logs" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Add payout_type column to crypto_withdrawals to distinguish auto vs manual
ALTER TABLE public.crypto_withdrawals 
ADD COLUMN IF NOT EXISTS payout_type TEXT DEFAULT 'manual';

-- Add auto_payout_threshold to have dynamic threshold
INSERT INTO public.admin_settings (key, value) 
VALUES 
  ('withdrawal_limits', '{"min": 10, "max": 1000}'::jsonb),
  ('auto_payout_threshold', '{"amount": 10}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Create trigger for updating updated_at
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();