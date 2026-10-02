-- SOLODOOR product catalogue for Supabase (Lovable Cloud).
-- Run this once, then import the CSVs in the order of their numeric prefix.
-- Text keys (handle / slug) are used instead of uuids so the CSVs import as they are.

create table applications (
  slug               text primary key,          -- door | kitchen | fridge | countertop | wall | electric-cabinet
  label              text not null,             -- tab label on the product page
  sort_order         int  not null default 0,
  sell_unit          text not null check (sell_unit in ('meter', 'side')),
  unit_price         numeric(10,2) not null,    -- price of one sell_unit, material only
  price_per_meter    numeric(10,2) not null,
  short_description  text,
  long_description   text,
  measuring_tip      text,
  recommended_addons text[] not null default '{}'
);

create table products (
  handle                 text primary key,      -- ascii id: storage folder and Shopify handle
  slug                   text not null unique,  -- URL slug (the model name)
  model_code             text,
  title                  text not null,
  product_type           text not null check (product_type in ('wallpaper', 'designed_door', 'pvc_rug')),
  style_family           text,
  finish                 text,
  material               text,
  base_price             numeric(10,2) not null,
  price_unit             text not null check (price_unit in ('meter', 'side', 'size')),
  short_description      text,
  long_description       text,
  roll_width_cm          numeric(6,1),
  thickness_mm           numeric(4,1),
  sample_available       boolean not null default false,
  installation_available boolean not null default false,
  is_active              boolean not null default true,
  sort_order             int not null default 0,
  shopify_product_id     text
);

-- One row per wallpaper and tab: the image shown on that tab, and the Shopify variant sold from it.
create table product_applications (
  product_handle     text not null references products(handle) on delete cascade,
  application_slug   text not null references applications(slug),
  image_source       text,                      -- file in the client's materials folder
  image_path         text,                      -- path in the "catalog" storage bucket
  price_override     numeric(10,2),             -- empty = the application's unit_price
  is_active          boolean not null default true,
  shopify_variant_id text,
  primary key (product_handle, application_slug)
);

create table product_images (
  id             bigint generated always as identity primary key,
  product_handle text not null references products(handle) on delete cascade,
  kind           text not null check (kind in ('swatch', 'roll', 'main', 'gallery')),
  sort_order     int not null default 0,
  image_source   text,
  image_path     text,
  alt            text
);

-- Colour variants of the designed doors.
create table product_variants (
  product_handle     text not null references products(handle) on delete cascade,
  variant_key        text not null,
  title              text not null,
  price              numeric(10,2) not null,
  image_source       text,
  image_path         text,
  sort_order         int not null default 0,
  is_active          boolean not null default true,
  shopify_variant_id text,
  primary key (product_handle, variant_key)
);

-- DIY tools, door strips and numbers, the installation service and the home sample.
create table addons (
  slug               text primary key,
  title              text not null,
  addon_type         text not null check (addon_type in ('diy_tool', 'door_strips', 'door_accessory', 'service', 'sample')),
  price              numeric(10,2),             -- empty = price not set yet
  applies_to         text[] not null default '{all}',  -- application slugs, or {all}
  description        text,
  image_source       text,
  image_path         text,
  is_active          boolean not null default true,
  sort_order         int not null default 0,
  shopify_variant_id text
);

-- Sizes and prices shared by every PVC rug.
create table rug_sizes (
  size_key           text primary key,
  width_cm           int not null,
  length_cm          int not null,
  price              numeric(10,2) not null,
  sort_order         int not null default 0,
  shopify_variant_id text
);

-- The catalogue is public: anyone can read, only the service role writes.
alter table applications         enable row level security;
alter table products             enable row level security;
alter table product_applications enable row level security;
alter table product_images       enable row level security;
alter table product_variants     enable row level security;
alter table addons               enable row level security;
alter table rug_sizes            enable row level security;

create policy "public read" on applications         for select using (true);
create policy "public read" on products             for select using (is_active);
create policy "public read" on product_applications for select using (is_active);
create policy "public read" on product_images       for select using (true);
create policy "public read" on product_variants     for select using (is_active);
create policy "public read" on addons               for select using (is_active);
create policy "public read" on rug_sizes            for select using (true);
