-- First, ensure the user exists in auth.users (this migration assumes the user will sign up or already exists)
-- Since we can't easily insert into auth.users via migration without knowing the UUID, 
-- we will create a trigger or a function that automatically assigns the admin role when this specific email signs up.

-- Create a function to set admin role by email
CREATE OR REPLACE FUNCTION public.set_admin_by_email(target_email TEXT)
RETURNS VOID AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get user ID from auth.users
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
    
    IF target_user_id IS NOT NULL THEN
        -- Insert or update role in user_roles
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- Also ensure they have a profile
        INSERT INTO public.profiles (id, username, email, balance)
        VALUES (target_user_id, 'Admin Adam', target_email, 0)
        ON CONFLICT (id) DO UPDATE SET email = target_email;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute for the specific admin email
-- Note: This will only work if the user already exists in auth.users.
-- If not, the user should sign up first, then this can be run, or we use a trigger.
SELECT public.set_admin_by_email('adamx000123@gmail.com');

-- Create a trigger to automatically assign admin role on signup for this specific email
CREATE OR REPLACE FUNCTION public.handle_new_admin_signup()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email = 'adamx000123@gmail.com' THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin')
        ON CONFLICT DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_admin_signup ON auth.users;
CREATE TRIGGER on_admin_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_signup();
