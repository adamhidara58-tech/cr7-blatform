
-- Recreate trigger for referral commissions on deposit transactions
DROP TRIGGER IF EXISTS on_transaction_insert ON public.transactions;
CREATE TRIGGER on_transaction_insert
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_referral_commission();

-- Recreate trigger for granting spin when referred user upgrades to VIP2
DROP TRIGGER IF EXISTS on_vip2_upgrade_grant_spin ON public.profiles;
CREATE TRIGGER on_vip2_upgrade_grant_spin
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_spin_on_vip2_upgrade();

-- Recreate trigger for updating updated_at column on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
