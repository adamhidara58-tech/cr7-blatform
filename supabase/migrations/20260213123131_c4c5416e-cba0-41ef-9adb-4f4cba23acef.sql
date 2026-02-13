
-- Add available_spins column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS available_spins integer NOT NULL DEFAULT 0;

-- Create function to grant spin when referred user upgrades to VIP2
CREATE OR REPLACE FUNCTION public.grant_spin_on_vip2_upgrade()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only trigger when vip_level changes TO 2 (from something less than 2)
  IF NEW.vip_level >= 2 AND (OLD.vip_level IS NULL OR OLD.vip_level < 2) THEN
    -- Check if this user was referred by someone
    IF NEW.referred_by IS NOT NULL THEN
      -- Grant 1 spin to the referrer
      UPDATE profiles
      SET available_spins = available_spins + 1,
          updated_at = now()
      WHERE id = NEW.referred_by;
      
      -- Log the spin grant as a transaction
      INSERT INTO transactions (user_id, type, amount, description, status, related_user_id)
      VALUES (
        NEW.referred_by,
        'commission',
        0,
        'لفة مجانية - إحالة ترقت إلى VIP2',
        'completed',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger on profiles update
CREATE TRIGGER on_vip2_upgrade_grant_spin
  AFTER UPDATE OF vip_level ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_spin_on_vip2_upgrade();
