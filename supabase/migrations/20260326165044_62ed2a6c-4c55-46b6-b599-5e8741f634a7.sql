CREATE OR REPLACE FUNCTION public.claim_daily_reward(p_user_id uuid, p_vip_level integer, p_amount numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_result JSONB;
  v_claim_id UUID;
  v_stats_id UUID;
BEGIN
  IF EXISTS (
    SELECT 1 FROM daily_claims 
    WHERE user_id = p_user_id 
    AND claimed_at = CURRENT_DATE
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_claimed');
  END IF;
  
  BEGIN
    INSERT INTO daily_claims (user_id, vip_level, amount, claimed_at)
    VALUES (p_user_id, p_vip_level, p_amount, CURRENT_DATE)
    RETURNING id INTO v_claim_id;
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_claimed');
  END;
  
  UPDATE profiles SET
    balance = balance + p_amount,
    total_earned = total_earned + p_amount,
    daily_challenges_completed = daily_challenges_completed + 1,
    updated_at = now()
  WHERE id = p_user_id;
  
  INSERT INTO transactions (user_id, type, amount, description, status)
  VALUES (
    p_user_id,
    'daily_reward',
    p_amount,
    'مكافأة يومية VIP ' || p_vip_level,
    'completed'
  );
  
  SELECT id INTO v_stats_id FROM platform_stats LIMIT 1;
  IF v_stats_id IS NOT NULL THEN
    UPDATE platform_stats SET
      total_paid = total_paid + p_amount,
      updated_at = now()
    WHERE id = v_stats_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'claim_id', v_claim_id,
    'amount', p_amount
  );
END;
$function$;