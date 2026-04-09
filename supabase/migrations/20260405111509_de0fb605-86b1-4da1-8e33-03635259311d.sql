
CREATE OR REPLACE FUNCTION public.get_email_by_username(_username text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.email
  FROM auth.users au
  JOIN public.profiles p ON p.id = au.id
  WHERE LOWER(p.username) = LOWER(_username)
  LIMIT 1;
$$;
