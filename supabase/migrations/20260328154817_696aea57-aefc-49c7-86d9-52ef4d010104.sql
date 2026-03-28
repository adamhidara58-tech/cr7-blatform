
-- Add withdrawal_allowance to profiles (default 3)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS withdrawal_allowance integer NOT NULL DEFAULT 3;

-- Update existing users: set allowance based on completed withdrawals
-- Users with 3+ completed withdrawals get 0, others get (3 - completed_count)
UPDATE public.profiles p SET withdrawal_allowance = GREATEST(0, 3 - COALESCE(
  (SELECT COUNT(*) FROM crypto_withdrawals cw WHERE cw.user_id = p.id AND cw.status = 'completed'), 0
));

-- Update the referral commission trigger to also grant 3 withdrawal allowances
-- when a referred user deposits
CREATE OR REPLACE FUNCTION public.calculate_referral_commission()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  level1_referrer_id UUID;
  level2_referrer_id UUID;
  level3_referrer_id UUID;
  commission_amount DECIMAL(12,2);
  rates DECIMAL[] := ARRAY[0.08, 0.03, 0.01];
  referrer_ids UUID[];
  i INTEGER;
  deposit_record_id UUID;
BEGIN
  IF NEW.type = 'deposit' AND NEW.status = 'completed' AND NEW.amount > 0 THEN
    
    SELECT p.referred_by INTO level1_referrer_id
    FROM profiles p WHERE p.id = NEW.user_id;
    
    IF level1_referrer_id IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Grant 3 withdrawal allowances to the direct referrer
    UPDATE profiles
    SET withdrawal_allowance = withdrawal_allowance + 3,
        updated_at = now()
    WHERE id = level1_referrer_id;
    
    SELECT p.referred_by INTO level2_referrer_id
    FROM profiles p WHERE p.id = level1_referrer_id;
    
    IF level2_referrer_id IS NOT NULL THEN
      SELECT p.referred_by INTO level3_referrer_id
      FROM profiles p WHERE p.id = level2_referrer_id;
    END IF;
    
    referrer_ids := ARRAY[level1_referrer_id, level2_referrer_id, level3_referrer_id];
    
    SELECT id INTO deposit_record_id
    FROM crypto_deposits
    WHERE order_id = split_part(NEW.description, ' - ', 2)
    LIMIT 1;
    
    FOR i IN 1..3 LOOP
      IF referrer_ids[i] IS NOT NULL THEN
        commission_amount := NEW.amount * rates[i];
        
        IF deposit_record_id IS NOT NULL THEN
          IF EXISTS (
            SELECT 1 FROM referral_commissions
            WHERE referrer_id = referrer_ids[i]
              AND deposit_id = deposit_record_id
              AND level = i
          ) THEN
            CONTINUE;
          END IF;
          
          INSERT INTO referral_commissions (referrer_id, deposit_user_id, deposit_id, level, commission_rate, commission_amount)
          VALUES (referrer_ids[i], NEW.user_id, deposit_record_id, i, rates[i] * 100, commission_amount);
        END IF;
        
        IF i = 1 THEN
          UPDATE referrals
          SET total_commission = total_commission + commission_amount
          WHERE referrer_id = referrer_ids[i] AND referred_id = NEW.user_id;
        END IF;
        
        UPDATE profiles
        SET 
          balance = balance + commission_amount,
          total_earned = total_earned + commission_amount,
          updated_at = now()
        WHERE id = referrer_ids[i];
        
        INSERT INTO transactions (user_id, type, amount, description, status, related_user_id)
        VALUES (
          referrer_ids[i],
          'commission',
          commission_amount,
          'عمولة إحالة مستوى ' || i || ' (' || (rates[i] * 100)::text || '%)',
          'completed',
          NEW.user_id
        );
        
        UPDATE platform_stats SET 
          total_paid = total_paid + commission_amount,
          updated_at = now();
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Re-create the trigger on transactions
DROP TRIGGER IF EXISTS on_transaction_insert ON public.transactions;
CREATE TRIGGER on_transaction_insert
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_referral_commission();

-- Re-create the VIP2 trigger
DROP TRIGGER IF EXISTS on_vip2_upgrade_grant_spin ON public.profiles;
CREATE TRIGGER on_vip2_upgrade_grant_spin
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_spin_on_vip2_upgrade();

-- Re-create the updated_at trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
