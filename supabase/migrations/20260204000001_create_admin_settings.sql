-- Create admin_settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all actions for authenticated users (assuming admin is authenticated)
-- Note: In a production environment, you should restrict this to admin users only
CREATE POLICY "Allow all for authenticated users" ON public.admin_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert default values
INSERT INTO public.admin_settings (key, value)
VALUES 
    ('withdrawal_limits', '{"min": "10", "max": "1000"}'),
    ('nowpayments_api_key', '{"value": "PFMSQ5C-F9M4ATH-Q0Y4PS7-SWKXEGK"}')
ON CONFLICT (key) DO NOTHING;
