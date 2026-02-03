-- Change vip_level column in daily_claims to numeric to support decimal levels like 0.5
ALTER TABLE public.daily_claims 
ALTER COLUMN vip_level TYPE numeric(3,1) USING vip_level::numeric(3,1);