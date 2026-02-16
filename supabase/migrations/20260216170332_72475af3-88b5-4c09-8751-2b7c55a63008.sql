-- Re-create the trigger to auto-create profiles on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also create the missing profile for the latest user who signed up without one
INSERT INTO public.profiles (id, username, email, referral_code, referred_by, referral_discount)
SELECT 
  'da49f48c-bc2b-4b95-8ec2-6a544241a0ef',
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
  email,
  public.generate_referral_code(),
  (SELECT p.id FROM public.profiles p WHERE p.referral_code = raw_user_meta_data->>'referral_code'),
  CASE WHEN raw_user_meta_data->>'referral_code' IS NOT NULL THEN 20.00 ELSE 0 END
FROM auth.users
WHERE id = 'da49f48c-bc2b-4b95-8ec2-6a544241a0ef'
ON CONFLICT (id) DO NOTHING;