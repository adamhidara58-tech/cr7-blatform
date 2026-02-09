-- 1. Function to safely increment balance (Atomic operation)
CREATE OR REPLACE FUNCTION public.increment_balance(user_id UUID, amount DECIMAL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    balance = balance + amount,
    total_earned = total_earned + amount,
    daily_challenges_completed = daily_challenges_completed + 1,
    updated_at = now()
  WHERE id = user_id;
END;
$$;

-- 2. Ensure 'avatars' bucket exists in storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND 
  (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND 
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- 3. Add Telegram Bot settings to admin_settings
INSERT INTO public.admin_settings (key, value)
VALUES 
    ('telegram_bot_token', '"7853634354:AAH_f879a-f428c4ac647b"'), -- Placeholder, user should update
    ('telegram_chat_id', '"123456789"') -- Placeholder, user should update
ON CONFLICT (key) DO NOTHING;
