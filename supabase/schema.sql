-- OURA Fashion Kid's — Supabase PostgreSQL Schema
-- Run this SQL in your Supabase Dashboard -> SQL Editor

create table if not exists public.products (
  id text primary key,
  slug text not null,
  name text not null,
  subtitle text not null default '',
  category text not null,
  age_brackets jsonb not null default '[]'::jsonb,
  available_sizes jsonb not null default '[]'::jsonb,
  price_pkr integer not null,
  stock_status text not null default 'in-stock',
  fabric_badge text not null default '100% Organic Cotton',
  hypoallergenic_note text not null default '',
  care_note text not null default '',
  description text not null default '',
  garment_model_type text not null default 'romper',
  palette jsonb not null default '{}'::jsonb,
  image_url text not null default '',
  is_new_arrival boolean not null default false,
  is_gift_set boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  order_number text primary key,
  status text not null default 'Pending',
  items jsonb not null default '[]'::jsonb,
  currency text not null default 'PKR',
  subtotal_pkr integer not null,
  discount_pkr integer not null default 0,
  gift_wrap_pkr integer not null default 0,
  shipping_pkr integer not null default 0,
  total_pkr integer not null,
  promo_code text,
  gift_wrap boolean not null default false,
  payment_method text not null default 'cod',
  delivery jsonb not null default '{}'::jsonb,
  estimated_delivery text not null default '2–4 Business Days',
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Products: Public storefront read access; authenticated admin write access
drop policy if exists "Public can view products" on public.products;
create policy "Public can view products"
  on public.products for select
  using (true);

drop policy if exists "Authenticated admin can insert products" on public.products;
create policy "Authenticated admin can insert products"
  on public.products for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated admin can update products" on public.products;
create policy "Authenticated admin can update products"
  on public.products for update
  to authenticated
  using (true);

drop policy if exists "Authenticated admin can delete products" on public.products;
create policy "Authenticated admin can delete products"
  on public.products for delete
  to authenticated
  using (true);

-- Orders: Customers can place orders and track orders by Order ID; authenticated admin can update statuses
drop policy if exists "Anyone can place an order" on public.orders;
create policy "Anyone can place an order"
  on public.orders for insert
  with check (true);

drop policy if exists "Anyone can track or view orders" on public.orders;
create policy "Anyone can track or view orders"
  on public.orders for select
  using (true);

drop policy if exists "Authenticated admin can update order status" on public.orders;
create policy "Authenticated admin can update order status"
  on public.orders for update
  to authenticated
  using (true);
