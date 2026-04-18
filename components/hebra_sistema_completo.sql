-- ============================================
-- HEBRA — Sistema completo
-- Turnos + Servicios + Pagos + Reseñas + Finanzas
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. SERVICIOS
-- Cada barbero define sus servicios con precio y duración
create table if not exists servicios (
  id uuid default gen_random_uuid() primary key,
  barbero_id uuid references profiles(id) on delete cascade not null,
  nombre text not null,
  descripcion text,
  precio integer not null, -- en pesos argentinos
  duracion integer not null default 30, -- en minutos
  activo boolean default true,
  orden integer default 0,
  created_at timestamptz default now()
);

-- 2. HORARIOS
-- Disponibilidad semanal del barbero
create table if not exists horarios (
  id uuid default gen_random_uuid() primary key,
  barbero_id uuid references profiles(id) on delete cascade not null,
  dia_semana integer not null check (dia_semana between 0 and 6), -- 0=domingo, 1=lunes...
  hora_inicio time not null,
  hora_fin time not null,
  activo boolean default true,
  constraint horario_unico unique (barbero_id, dia_semana)
);

-- 3. TURNOS
-- Reservas de clientes con barberos
create table if not exists turnos (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references auth.users(id) on delete set null,
  barbero_id uuid references profiles(id) on delete cascade not null,
  servicio_id uuid references servicios(id) on delete set null,
  fecha date not null,
  hora time not null,
  duracion integer not null default 30,
  precio integer not null,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'confirmado', 'completado', 'cancelado', 'no_asistio')),
  metodo_pago text default 'efectivo'
    check (metodo_pago in ('efectivo', 'mercadopago', 'transferencia')),
  notas text,
  cliente_nombre text, -- para clientes sin cuenta
  cliente_telefono text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index para búsquedas rápidas
create index if not exists idx_turnos_barbero_fecha on turnos(barbero_id, fecha);
create index if not exists idx_turnos_cliente on turnos(cliente_id);
create index if not exists idx_turnos_estado on turnos(estado);

-- 4. PAGOS
-- Registro de transacciones
create table if not exists pagos (
  id uuid default gen_random_uuid() primary key,
  turno_id uuid references turnos(id) on delete cascade not null,
  barbero_id uuid references profiles(id) on delete cascade not null,
  monto integer not null,
  metodo text not null check (metodo in ('efectivo', 'mercadopago', 'transferencia')),
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'aprobado', 'rechazado', 'reembolsado')),
  mp_payment_id text, -- ID de MercadoPago
  mp_preference_id text,
  mp_status text,
  created_at timestamptz default now()
);

-- 5. RESEÑAS
-- Solo después de un turno completado
create table if not exists resenas (
  id uuid default gen_random_uuid() primary key,
  turno_id uuid references turnos(id) on delete cascade not null,
  barbero_id uuid references profiles(id) on delete cascade not null,
  cliente_id uuid references auth.users(id) on delete set null,
  calificacion integer not null check (calificacion between 1 and 5),
  comentario text,
  created_at timestamptz default now(),
  constraint una_resena_por_turno unique (turno_id)
);

-- 6. FAVORITOS
create table if not exists favoritos (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references auth.users(id) on delete cascade not null,
  barbero_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  constraint favorito_unico unique (cliente_id, barbero_id)
);

-- 7. VISITAS (tracking de perfil)
create table if not exists visitas (
  id uuid default gen_random_uuid() primary key,
  barbero_id uuid references profiles(id) on delete cascade not null,
  visitante_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- ============================================
-- VISTAS para dashboards y reportes
-- ============================================

-- Promedio de reseñas por barbero
create or replace view v_rating_barberos as
select
  barbero_id,
  round(avg(calificacion)::numeric, 1) as promedio,
  count(*) as total_resenas
from resenas
group by barbero_id;

-- Finanzas diarias del barbero
create or replace view v_finanzas_diarias as
select
  barbero_id,
  fecha,
  count(*) filter (where estado = 'completado') as turnos_completados,
  count(*) filter (where estado = 'cancelado') as turnos_cancelados,
  count(*) filter (where estado = 'no_asistio') as turnos_no_asistio,
  coalesce(sum(precio) filter (where estado = 'completado'), 0) as ingreso_total,
  coalesce(sum(precio) filter (where estado = 'completado' and metodo_pago = 'efectivo'), 0) as ingreso_efectivo,
  coalesce(sum(precio) filter (where estado = 'completado' and metodo_pago = 'mercadopago'), 0) as ingreso_mp,
  coalesce(sum(precio) filter (where estado = 'completado' and metodo_pago = 'transferencia'), 0) as ingreso_transferencia
from turnos
group by barbero_id, fecha;

-- Finanzas mensuales
create or replace view v_finanzas_mensuales as
select
  barbero_id,
  date_trunc('month', fecha)::date as mes,
  count(*) filter (where estado = 'completado') as turnos_completados,
  coalesce(sum(precio) filter (where estado = 'completado'), 0) as ingreso_total,
  coalesce(sum(precio) filter (where estado = 'completado' and metodo_pago = 'efectivo'), 0) as ingreso_efectivo,
  coalesce(sum(precio) filter (where estado = 'completado' and metodo_pago = 'mercadopago'), 0) as ingreso_mp
from turnos
group by barbero_id, date_trunc('month', fecha);

-- Ranking de barberos por zona (para el "PedidosYa de barberos")
create or replace view v_barberos_ranking as
select
  p.id,
  p.name,
  p.city,
  p.avatar_url,
  p.bio,
  p.skills,
  coalesce(r.promedio, 0) as rating,
  coalesce(r.total_resenas, 0) as total_resenas,
  coalesce(t.turnos_mes, 0) as turnos_mes,
  coalesce(v.visitas_mes, 0) as visitas_mes
from profiles p
left join v_rating_barberos r on r.barbero_id = p.id
left join (
  select barbero_id, count(*) as turnos_mes
  from turnos
  where estado = 'completado'
    and fecha >= date_trunc('month', current_date)
  group by barbero_id
) t on t.barbero_id = p.id
left join (
  select barbero_id, count(*) as visitas_mes
  from visitas
  where created_at >= date_trunc('month', current_date)
  group by barbero_id
) v on v.barbero_id = p.id
where p.role = 'barbero'
order by r.promedio desc nulls last, t.turnos_mes desc nulls last;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Servicios: barbero puede CRUD los suyos, todos pueden leer activos
alter table servicios enable row level security;
create policy "Barbero gestiona sus servicios" on servicios
  for all to authenticated using (barbero_id = auth.uid())
  with check (barbero_id = auth.uid());
create policy "Todos ven servicios activos" on servicios
  for select to anon, authenticated using (activo = true);

-- Horarios: barbero gestiona, todos leen
alter table horarios enable row level security;
create policy "Barbero gestiona sus horarios" on horarios
  for all to authenticated using (barbero_id = auth.uid())
  with check (barbero_id = auth.uid());
create policy "Todos ven horarios activos" on horarios
  for select to anon, authenticated using (activo = true);

-- Turnos: cliente crea, barbero y cliente ven los suyos
alter table turnos enable row level security;
create policy "Cliente crea turnos" on turnos
  for insert to authenticated
  with check (cliente_id = auth.uid());
create policy "Ver mis turnos como cliente" on turnos
  for select to authenticated using (cliente_id = auth.uid());
create policy "Ver mis turnos como barbero" on turnos
  for select to authenticated using (barbero_id = auth.uid());
create policy "Barbero actualiza sus turnos" on turnos
  for update to authenticated using (barbero_id = auth.uid());

-- Pagos: solo lectura para participantes
alter table pagos enable row level security;
create policy "Ver pagos de mis turnos" on pagos
  for select to authenticated
  using (barbero_id = auth.uid() or turno_id in (
    select id from turnos where cliente_id = auth.uid()
  ));
create policy "Sistema crea pagos" on pagos
  for insert to authenticated with check (true);

-- Reseñas: cliente crea, todos leen
alter table resenas enable row level security;
create policy "Cliente crea resena" on resenas
  for insert to authenticated
  with check (cliente_id = auth.uid());
create policy "Todos leen resenas" on resenas
  for select to anon, authenticated using (true);

-- Favoritos
alter table favoritos enable row level security;
create policy "Cliente gestiona favoritos" on favoritos
  for all to authenticated
  using (cliente_id = auth.uid())
  with check (cliente_id = auth.uid());

-- Visitas
alter table visitas enable row level security;
create policy "Todos crean visitas" on visitas
  for insert to authenticated with check (true);
create policy "Barbero ve sus visitas" on visitas
  for select to authenticated using (barbero_id = auth.uid());

-- ============================================
-- DATOS SEED — Servicios para barberos existentes
-- ============================================

-- Insertar servicios para los primeros 3 barberos seed
-- (asumiendo que ya existen en profiles)
do $$
declare
  barbero record;
  counter int := 0;
begin
  for barbero in
    select id from profiles where role = 'barbero' limit 5
  loop
    counter := counter + 1;

    insert into servicios (barbero_id, nombre, descripcion, precio, duracion, orden) values
      (barbero.id, 'Corte clasico', 'Corte de pelo clasico con tijera o maquina', 5000, 30, 1),
      (barbero.id, 'Corte + barba', 'Corte de pelo completo mas perfilado de barba', 7500, 45, 2),
      (barbero.id, 'Barba', 'Perfilado y arreglo de barba con navaja', 3500, 20, 3),
      (barbero.id, 'Corte degradado', 'Fade bajo, medio o alto con diseno', 6000, 40, 4)
    on conflict do nothing;

    -- Horarios de lunes a sabado 9-19
    insert into horarios (barbero_id, dia_semana, hora_inicio, hora_fin) values
      (barbero.id, 1, '09:00', '19:00'),
      (barbero.id, 2, '09:00', '19:00'),
      (barbero.id, 3, '09:00', '19:00'),
      (barbero.id, 4, '09:00', '19:00'),
      (barbero.id, 5, '09:00', '19:00'),
      (barbero.id, 6, '09:00', '14:00')
    on conflict do nothing;
  end loop;
end $$;

-- ============================================
-- FUNCIONES para la API
-- ============================================

-- Función para obtener horarios disponibles de un barbero en una fecha
create or replace function get_horarios_disponibles(
  p_barbero_id uuid,
  p_fecha date
)
returns table (hora time) as $$
declare
  v_dia_semana int;
  v_hora_inicio time;
  v_hora_fin time;
  v_duracion interval := interval '30 minutes';
  v_slot time;
begin
  v_dia_semana := extract(dow from p_fecha)::int;

  select h.hora_inicio, h.hora_fin
  into v_hora_inicio, v_hora_fin
  from horarios h
  where h.barbero_id = p_barbero_id
    and h.dia_semana = v_dia_semana
    and h.activo = true;

  if v_hora_inicio is null then
    return;
  end if;

  v_slot := v_hora_inicio;
  while v_slot < v_hora_fin loop
    if not exists (
      select 1 from turnos t
      where t.barbero_id = p_barbero_id
        and t.fecha = p_fecha
        and t.hora = v_slot
        and t.estado in ('pendiente', 'confirmado')
    ) then
      hora := v_slot;
      return next;
    end if;
    v_slot := v_slot + v_duracion;
  end loop;
end;
$$ language plpgsql;

-- Función para estadísticas del dashboard del barbero
create or replace function get_stats_barbero(p_barbero_id uuid)
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'turnos_hoy', (
      select count(*) from turnos
      where barbero_id = p_barbero_id
        and fecha = current_date
        and estado in ('pendiente', 'confirmado')
    ),
    'turnos_semana', (
      select count(*) from turnos
      where barbero_id = p_barbero_id
        and fecha >= date_trunc('week', current_date)
        and fecha < date_trunc('week', current_date) + interval '7 days'
        and estado in ('pendiente', 'confirmado', 'completado')
    ),
    'ingreso_hoy', (
      select coalesce(sum(precio), 0) from turnos
      where barbero_id = p_barbero_id
        and fecha = current_date
        and estado = 'completado'
    ),
    'ingreso_mes', (
      select coalesce(sum(precio), 0) from turnos
      where barbero_id = p_barbero_id
        and fecha >= date_trunc('month', current_date)
        and estado = 'completado'
    ),
    'rating', (
      select round(avg(calificacion)::numeric, 1) from resenas
      where barbero_id = p_barbero_id
    ),
    'total_resenas', (
      select count(*) from resenas
      where barbero_id = p_barbero_id
    ),
    'total_clientes', (
      select count(distinct cliente_id) from turnos
      where barbero_id = p_barbero_id
        and estado = 'completado'
    ),
    'visitas_mes', (
      select count(*) from visitas
      where barbero_id = p_barbero_id
        and created_at >= date_trunc('month', current_date)
    )
  ) into result;
  return result;
end;
$$ language plpgsql;
