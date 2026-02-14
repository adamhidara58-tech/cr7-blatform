
-- 1. Create referral_commissions table for idempotent tracking
CREATE TABLE public.referral_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id),
  deposit_user_id UUID NOT NULL REFERENCES public.profiles(id),
  deposit_id UUID NOT NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
  commission_rate NUMERIC NOT NULL,
  commission_amount NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, deposit_id, level)
);

ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own commissions"
ON public.referral_commissions FOR SELECT
USING (referrer_id = auth.uid());

CREATE POLICY "Admin can view all commissions"
ON public.referral_commissions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Index for fast lookups
CREATE INDEX idx_referral_commissions_referrer ON public.referral_commissions(referrer_id);
CREATE INDEX idx_referral_commissions_deposit ON public.referral_commissions(deposit_id);

-- 2. Replace the old calculate_referral_commission trigger function with 3-level system
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
  -- Only process completed deposits
  IF NEW.type = 'deposit' AND NEW.status = 'completed' AND NEW.amount > 0 THEN
    
    -- Get Level 1 referrer (direct)
    SELECT p.referred_by INTO level1_referrer_id
    FROM profiles p WHERE p.id = NEW.user_id;
    
    IF level1_referrer_id IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Get Level 2 referrer
    SELECT p.referred_by INTO level2_referrer_id
    FROM profiles p WHERE p.id = level1_referrer_id;
    
    -- Get Level 3 referrer
    IF level2_referrer_id IS NOT NULL THEN
      SELECT p.referred_by INTO level3_referrer_id
      FROM profiles p WHERE p.id = level2_referrer_id;
    END IF;
    
    referrer_ids := ARRAY[level1_referrer_id, level2_referrer_id, level3_referrer_id];
    
    -- Try to find the deposit record ID for idempotency
    SELECT id INTO deposit_record_id
    FROM crypto_deposits
    WHERE order_id = split_part(NEW.description, ' - ', 2)
    LIMIT 1;
    
    -- Process each level
    FOR i IN 1..3 LOOP
      IF referrer_ids[i] IS NOT NULL THEN
        commission_amount := NEW.amount * rates[i];
        
        -- Check idempotency if we have a deposit_id
        IF deposit_record_id IS NOT NULL THEN
          IF EXISTS (
            SELECT 1 FROM referral_commissions
            WHERE referrer_id = referrer_ids[i]
              AND deposit_id = deposit_record_id
              AND level = i
          ) THEN
            CONTINUE; -- Skip, already processed
          END IF;
          
          -- Record the commission
          INSERT INTO referral_commissions (referrer_id, deposit_user_id, deposit_id, level, commission_rate, commission_amount)
          VALUES (referrer_ids[i], NEW.user_id, deposit_record_id, i, rates[i] * 100, commission_amount);
        END IF;
        
        -- Update referral record total (only for level 1)
        IF i = 1 THEN
          UPDATE referrals
          SET total_commission = total_commission + commission_amount
          WHERE referrer_id = referrer_ids[i] AND referred_id = NEW.user_id;
        END IF;
        
        -- Add commission to referrer's balance
        UPDATE profiles
        SET 
          balance = balance + commission_amount,
          total_earned = total_earned + commission_amount,
          updated_at = now()
        WHERE id = referrer_ids[i];
        
        -- Create commission transaction for referrer
        INSERT INTO transactions (user_id, type, amount, description, status, related_user_id)
        VALUES (
          referrer_ids[i],
          'commission',
          commission_amount,
          'عمولة إحالة مستوى ' || i || ' (' || (rates[i] * 100)::text || '%)',
          'completed',
          NEW.user_id
        );
        
        -- Update platform total paid
        UPDATE platform_stats SET 
          total_paid = total_paid + commission_amount,
          updated_at = now();
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$function$;
