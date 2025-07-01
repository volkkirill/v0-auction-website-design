-- Ensure image_urls column in lots table is NOT NULL and defaults to an empty array
ALTER TABLE public.lots ALTER COLUMN image_urls SET DEFAULT '{}';
ALTER TABLE public.lots ALTER COLUMN image_urls SET NOT NULL;
