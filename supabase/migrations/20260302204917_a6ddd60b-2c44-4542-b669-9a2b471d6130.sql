
-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Create a new policy that requires authentication
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);
