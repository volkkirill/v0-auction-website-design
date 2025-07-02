-- Add commission_percentage to auctions table
ALTER TABLE public.auctions
ADD COLUMN commission_percentage NUMERIC(5, 2) DEFAULT 0.00 NOT NULL;

-- Add a check constraint to ensure commission_percentage is between 0 and 100
ALTER TABLE public.auctions
ADD CONSTRAINT check_commission_percentage
CHECK (commission_percentage >= 0 AND commission_percentage <= 100);
