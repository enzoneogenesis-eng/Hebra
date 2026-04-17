-- =====================================================
-- HEBRA — Tablas para funcionalidades de clientes
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Favoritos
create table if not exists public.favoritos (
  id         uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.profiles(id) on delete cascade,
  barbero_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(cliente_id, barbero_id)
);
alter table public.favoritos enable row level security;
create policy "favoritos_select_own" on public.favoritos for select using (auth.uid() = cliente_id);
create policy "favoritos_insert_own" on public.favoritos for insert with check (auth.uid() = cliente_id);
create policy "favoritos_delete_own" on public.favoritos for delete using (auth.uid() = cliente_id);

-- 2. Historial de visitas
create table if not exists public.historial (
  id         uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.profiles(id) on delete cascade,
  barbero_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);
alter table public.historial enable row level security;
create policy "historial_select_own" on public.historial for select using (auth.uid() = cliente_id);
create policy "historial_insert_own" on public.historial for insert with check (auth.uid() = cliente_id);

-- 3. Suscripciones a ciudades
create table if not exists public.suscripciones_ciudad (
  id         uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.profiles(id) on delete cascade,
  ciudad     text not null,
  created_at timestamptz default now(),
  unique(cliente_id, ciudad)
);
alter table public.suscripciones_ciudad enable row level security;
create policy "suscripciones_select_own" on public.suscripciones_ciudad for select using (auth.uid() = cliente_id);
create policy "suscripciones_insert_own" on public.suscripciones_ciudad for insert with check (auth.uid() = cliente_id);
create policy "suscripciones_delete_own" on public.suscripciones_ciudad for delete using (auth.uid() = cliente_id);

-- 4. Notificaciones
create table if not exists public.notificaciones (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  tipo       text not null,
  titulo     text not null,
  mensaje    text not null,
  leida      boolean default false,
  data       jsonb,
  created_at timestamptz default now()
);
alter table public.notificaciones enable row level security;
create policy "notificaciones_select_own" on public.notificaciones for select using (auth.uid() = user_id);
create policy "notificaciones_update_own" on public.notificaciones for update using (auth.uid() = user_id);
