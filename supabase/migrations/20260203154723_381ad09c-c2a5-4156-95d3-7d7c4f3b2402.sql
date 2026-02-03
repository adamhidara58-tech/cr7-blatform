-- Create a table to track daily claims
CREATE TABLE public.daily_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vip_level INTEGER NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  claimed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, claimed_at)
);

-- Enable RLS
ALTER TABLE public.daily_claims ENABLE ROW LEVEL SECURITY;

-- Users can view their own claims
CREATE POLICY "Users can view their own claims" 
ON public.daily_claims 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own claims
CREATE POLICY "Users can create their own claims" 
ON public.daily_claims 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add referral_discount column to profiles (for users who signed up via referral)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_discount DECIMAL(12,2) DEFAULT 0;

-- Update the handle_new_user function to add $20 discount for referred users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  referrer_profile_id UUID;
  new_referral_code TEXT;
BEGIN
  -- Generate unique referral code
  new_referral_code := generate_referral_code();
  
  -- Check if user was referred by someone
  IF NEW.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
    SELECT id INTO referrer_profile_id
    FROM profiles
    WHERE referral_code = NEW.raw_user_meta_data->>'referral_code';
  END IF;
  
  -- Insert profile with referral discount if referred
  INSERT INTO profiles (id, username, email, referral_code, referred_by, referral_discount)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    new_referral_code,
    referrer_profile_id,
    CASE WHEN referrer_profile_id IS NOT NULL THEN 20.00 ELSE 0 END
  );
  
  -- If referred, create referral record
  IF referrer_profile_id IS NOT NULL THEN
    INSERT INTO referrals (referrer_id, referred_id)
    VALUES (referrer_profile_id, NEW.id);
  END IF;
  
  -- Update platform stats
  UPDATE platform_stats SET 
    total_users = total_users + 1,
    updated_at = now();
  
  RETURN NEW;
END;
$function$;