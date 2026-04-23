CREATE TABLE IF NOT EXISTS public.demo_spins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  spun_at date NOT NULL DEFAULT CURRENT_DATE,
  won_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_demo_spins_user_date ON public.demo_spins(user_id, spun_at);

ALTER TABLE public.demo_spins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own demo spins"
  ON public.demo_spins FOR SELECT
  USING (auth.uid() = user_id);