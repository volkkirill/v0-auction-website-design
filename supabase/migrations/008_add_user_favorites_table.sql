create table public.user_favorites (
    id uuid not null default gen_random_uuid (),
    user_id uuid not null,
    lot_id uuid not null,
    created_at timestamp with time zone not null default now(),
    constraint user_favorites_pkey primary key (id),
    constraint user_favorites_lot_id_fkey foreign key (lot_id) references lots (id) on delete cascade,
    constraint user_favorites_user_id_fkey foreign key (user_id) references profiles (id) on delete cascade,
    constraint user_favorites_user_id_lot_id_key unique (user_id, lot_id)
);

alter table public.user_favorites enable row security;

create policy "Allow authenticated users to read their own favorites."
on public.user_favorites for select
using (auth.uid() = user_id);

create policy "Allow authenticated users to insert their own favorites."
on public.user_favorites for insert
with check (auth.uid() = user_id);

create policy "Allow authenticated users to delete their own favorites."
on public.user_favorites for delete
using (auth.uid() = user_id);
