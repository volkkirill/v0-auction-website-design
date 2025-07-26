-- Add fields for live auction functionality
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT FALSE;
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS current_lot_id UUID REFERENCES lots(id);
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS lot_duration_minutes INTEGER DEFAULT 5;

-- Add fields for lot timing in live auctions
ALTER TABLE lots ADD COLUMN IF NOT EXISTS lot_order INTEGER DEFAULT 0;
ALTER TABLE lots ADD COLUMN IF NOT EXISTS lot_start_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE lots ADD COLUMN IF NOT EXISTS lot_end_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE lots ADD COLUMN IF NOT EXISTS is_sold BOOLEAN DEFAULT FALSE;

-- Create index for lot ordering
CREATE INDEX IF NOT EXISTS idx_lots_auction_order ON lots(auction_id, lot_order);

-- Create table for tracking online participants
CREATE TABLE IF NOT EXISTS auction_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(auction_id, user_id)
);

-- Enable RLS
ALTER TABLE auction_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for auction_participants
CREATE POLICY "Users can view auction participants" ON auction_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own participation" ON auction_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" ON auction_participants
  FOR UPDATE USING (auth.uid() = user_id);
