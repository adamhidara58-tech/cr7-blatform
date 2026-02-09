-- Ensure profiles are created for existing users if they don't have one
INSERT INTO public.profiles (id, username, email, referral_code)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)), 
    email, 
    'CR7' || upper(substring(md5(random()::text) from 1 for 6))
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Fix RLS Policies for profiles to be more robust
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Ensure the trigger function is robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_profile_id UUID;
  new_referral_code TEXT;
  username_val TEXT;
BEGIN
  -- Generate unique referral code
  new_referral_code := 'CR7' || upper(substring(md5(random()::text) from 1 for 6));
  
  -- Check if user was referred by someone
  IF NEW.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
    SELECT id INTO referrer_profile_id
    FROM public.profiles
    WHERE referral_code = NEW.raw_user_meta_data->>'referral_code';
  END IF;
  
  username_val := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));

  -- Insert profile with error handling
  BEGIN
    INSERT INTO public.profiles (id, username, email, referral_code, referred_by)
    VALUES (
      NEW.id,
      username_val,
      NEW.email,
      new_referral_code,
      referrer_profile_id
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log error or handle it (e.g., if referral_code collision happens, though unlikely with md5)
    -- We can retry once with a different code if needed
    new_referral_code := 'CR7' || upper(substring(md5(random()::text || 'retry') from 1 for 6));
    INSERT INTO public.profiles (id, username, email, referral_code, referred_by)
    VALUES (NEW.id, username_val, NEW.email, new_referral_code, referrer_profile_id)
    ON CONFLICT (id) DO NOTHING;
  END;
  
  -- If referred, create referral record
  IF referrer_profile_id IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_id, referred_id)
    VALUES (referrer_profile_id, NEW.id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Update platform stats
  UPDATE public.platform_stats SET 
    total_users = total_users + 1,
    updated_at = now();
  
  RETURN NEW;
END;
$$;
