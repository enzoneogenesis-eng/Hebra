-- =====================================================
-- HEBRA — Sistema de búsqueda de barberos por salones
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- La tabla ofertas ya existe, le agregamos campos si faltan
alter table public.ofertas 
  add column if not exists ciudad      text,
  add column if not exists skills      text[],
  add column if not exists tipo_empleo text default 'relacion_dependencia',
  add column if not exists activa      boolean default true;

-- Postulaciones de barberos a ofertas
create table if not exists public.postulaciones (
  id         uuid primary key default gen_random_uuid(),
  oferta_id  uuid not null references public.ofertas(id)  on delete cascade,
  barbero_id uuid not null references public.profiles(id) on delete cascade,
  mensaje    text,
  estado     text default 'pendiente', -- pendiente | vista | aceptada | rechazada
  created_at timestamptz default now(),
  unique(oferta_id, barbero_id)
);

alter table public.postulaciones enable row level security;
create policy "postulaciones_select_salon"   on public.postulaciones for select using (
  auth.uid() = barbero_id or
  auth.uid() in (select salon_id from public.ofertas where id = oferta_id)
);
create policy "postulaciones_insert_barbero" on public.postulaciones for insert with check (auth.uid() = barbero_id);
create policy "postulaciones_update_salon"   on public.postulaciones for update using (
  auth.uid() in (select salon_id from public.ofertas where id = oferta_id)
);
create policy "postulaciones_delete_barbero" on public.postulaciones for delete using (auth.uid() = barbero_id);
