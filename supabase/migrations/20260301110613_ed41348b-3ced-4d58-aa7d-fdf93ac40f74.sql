CREATE TABLE public.catches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fish TEXT NOT NULL,
  length NUMERIC DEFAULT 0,
  weight NUMERIC DEFAULT 0,
  water TEXT DEFAULT '',
  bait TEXT DEFAULT '',
  technique TEXT DEFAULT '',
  catch_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.catches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own catches" ON public.catches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own catches" ON public.catches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own catches" ON public.catches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own catches" ON public.catches
  FOR DELETE USING (auth.uid() = user_id);