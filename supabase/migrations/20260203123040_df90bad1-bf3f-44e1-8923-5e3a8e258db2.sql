-- Fix infinite recursion in profiles RLS by removing self-referencing policy

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop the recursive policy (may exist from earlier setup)
DROP POLICY IF EXISTS "Users can view referrer profiles" ON public.profiles;

-- Keep (or recreate) safe self-only policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow viewing profiles connected via referrals without referencing profiles table inside itself
-- (No recursion: subquery hits public.referrals only)
DROP POLICY IF EXISTS "Users can view referral-linked profiles" ON public.profiles;
CREATE POLICY "Users can view referral-linked profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id
  OR id IN (
    SELECT r.referrer_id FROM public.referrals r WHERE r.referred_id = auth.uid()
  )
  OR id IN (
    SELECT r.referred_id FROM public.referrals r WHERE r.referrer_id = auth.uid()
  )
);
