CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lot_id UUID REFERENCES public.lots(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, lot_id) -- Ensure a user can only favorite a lot once
);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own favorites." ON user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can select their own favorites." ON user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites." ON user_favorites FOR DELETE USING (auth.uid() = user_id);
