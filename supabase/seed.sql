-- =====================================================
-- HEBRA — Seed de 15 barberos ficticios argentinos
-- Ejecutar en Supabase SQL Editor
-- =====================================================

DO $$
DECLARE
  u1  uuid := '11111111-0001-0001-0001-000000000001';
  u2  uuid := '11111111-0002-0002-0002-000000000002';
  u3  uuid := '11111111-0003-0003-0003-000000000003';
  u4  uuid := '11111111-0004-0004-0004-000000000004';
  u5  uuid := '11111111-0005-0005-0005-000000000005';
  u6  uuid := '11111111-0006-0006-0006-000000000006';
  u7  uuid := '11111111-0007-0007-0007-000000000007';
  u8  uuid := '11111111-0008-0008-0008-000000000008';
  u9  uuid := '11111111-0009-0009-0009-000000000009';
  u10 uuid := '11111111-0010-0010-0010-000000000010';
  u11 uuid := '11111111-0011-0011-0011-000000000011';
  u12 uuid := '11111111-0012-0012-0012-000000000012';
  u13 uuid := '11111111-0013-0013-0013-000000000013';
  u14 uuid := '11111111-0014-0014-0014-000000000014';
  u15 uuid := '11111111-0015-0015-0015-000000000015';
BEGIN

-- Insertar usuarios en auth.users (con email confirmado)
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_user_meta_data, aud, role)
VALUES
  (u1,  'matias.rodriguez@hebra.app',  now(), now(), now(), '{"tipo":"barbero","nombre":"Matías Rodríguez"}', 'authenticated', 'authenticated'),
  (u2,  'lucas.fernandez@hebra.app',   now(), now(), now(), '{"tipo":"barbero","nombre":"Lucas Fernández"}',  'authenticated', 'authenticated'),
  (u3,  'diego.gomez@hebra.app',       now(), now(), now(), '{"tipo":"barbero","nombre":"Diego Gómez"}',      'authenticated', 'authenticated'),
  (u4,  'nicolas.lopez@hebra.app',     now(), now(), now(), '{"tipo":"barbero","nombre":"Nicolás López"}',    'authenticated', 'authenticated'),
  (u5,  'julian.martinez@hebra.app',   now(), now(), now(), '{"tipo":"barbero","nombre":"Julián Martínez"}',  'authenticated', 'authenticated'),
  (u6,  'barberia.sanmartin@hebra.app',now(), now(), now(), '{"tipo":"salon","nombre":"Barbería San Martín"}','authenticated', 'authenticated'),
  (u7,  'franco.perez@hebra.app',      now(), now(), now(), '{"tipo":"barbero","nombre":"Franco Pérez"}',     'authenticated', 'authenticated'),
  (u8,  'gabriel.sanchez@hebra.app',   now(), now(), now(), '{"tipo":"barbero","nombre":"Gabriel Sánchez"}',  'authenticated', 'authenticated'),
  (u9,  'andres.torres@hebra.app',     now(), now(), now(), '{"tipo":"barbero","nombre":"Andrés Torres"}',    'authenticated', 'authenticated'),
  (u10, 'elrincon@hebra.app',          now(), now(), now(), '{"tipo":"salon","nombre":"El Rincón del Barbero"}','authenticated','authenticated'),
  (u11, 'leandro.diaz@hebra.app',      now(), now(), now(), '{"tipo":"barbero","nombre":"Leandro Díaz"}',     'authenticated', 'authenticated'),
  (u12, 'martin.vargas@hebra.app',     now(), now(), now(), '{"tipo":"barbero","nombre":"Martín Vargas"}',    'authenticated', 'authenticated'),
  (u13, 'emiliano.castro@hebra.app',   now(), now(), now(), '{"tipo":"barbero","nombre":"Emiliano Castro"}',  'authenticated', 'authenticated'),
  (u14, 'studionavajas@hebra.app',     now(), now(), now(), '{"tipo":"salon","nombre":"Studio Navajas"}',     'authenticated', 'authenticated'),
  (u15, 'ezequiel.romero@hebra.app',   now(), now(), now(), '{"tipo":"barbero","nombre":"Ezequiel Romero"}',  'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Insertar perfiles públicos
INSERT INTO public.profiles (id, tipo, nombre, bio, ubicacion, telefono, instagram, skills, foto_url, created_at)
VALUES

(u1, 'barbero', 'Matías Rodríguez',
 'Barbero con 8 años de experiencia. Especialista en degradé y diseño de barba. Formado en Buenos Aires y Madrid.',
 'Palermo, CABA', '+5491123456701', 'mati.cuts.bsas',
 ARRAY['Degradé', 'Diseño de barba', 'Clásico', 'Navaja'],
 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop&crop=face',
 now() - interval '45 days'),

(u2, 'barbero', 'Lucas Fernández',
 'Barbero clásico con onda vintage. Me especializo en cortes texturizados y tratamientos de barba al estilo inglés.',
 'San Telmo, CABA', '+5491123456702', 'lucas.vintage.barber',
 ARRAY['Textura', 'Barba completa', 'Buzz cut', 'Perfilado'],
 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
 now() - interval '38 days'),

(u3, 'barbero', 'Diego Gómez',
 'Fanático del mullet y los cortes modernos. Si querés algo diferente y con personalidad, este es tu lugar.',
 'Belgrano, CABA', '+5491123456703', 'diego.mullet.king',
 ARRAY['Mullet', 'Undercut', 'Textura', 'Color fantasía'],
 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face',
 now() - interval '30 days'),

(u4, 'barbero', 'Nicolás López',
 'Barbero rosarino con 6 años en el rubro. Especialidad en cortes afro y rizados. El pelo rizado también merece arte.',
 'Rosario, Santa Fe', '+5493413456704', 'nico.afro.rosario',
 ARRAY['Afro', 'Rizado', 'Degradé', 'Trenzas'],
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
 now() - interval '25 days'),

(u5, 'barbero', 'Julián Martínez',
 'Cordobés 100%. Barbero de barrio con precios justos y trabajo de primera. Atiendo con turno previo.',
 'Nueva Córdoba, Córdoba', '+5493514456705', 'julian.barber.cba',
 ARRAY['Clásico', 'Degradé', 'Perfilado', 'Barba francesa'],
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
 now() - interval '20 days'),

(u6, 'salon', 'Barbería San Martín',
 'El salón de barbería más tradicional de Mendoza. Abierto desde 2010. Equipo de 4 barberos. Turnos online.',
 'Ciudad, Mendoza', '+5492614456706', 'barberia.sanmartin.mdz',
 ARRAY['Clásico', 'Degradé', 'Afeitado navaja', 'Barba completa', 'Keratina'],
 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=400&fit=crop',
 now() - interval '60 days'),

(u7, 'barbero', 'Franco Pérez',
 'Barbero y artista. Cada corte es una obra. Me especializo en diseños geométricos y fade de alta precisión.',
 'Villa Crespo, CABA', '+5491123456707', 'franco.fade.art',
 ARRAY['Degradé', 'Buzz cut', 'Diseño de barba', 'Undercut'],
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
 now() - interval '15 days'),

(u8, 'barbero', 'Gabriel Sánchez',
 'Barbero marplatense. Trabajo todo el año, turismo o no. Cortes modernos con onda surfera y relajada.',
 'Mar del Plata, Buenos Aires', '+5492234456708', 'gabi.barber.mdp',
 ARRAY['Textura', 'Largo', 'Peinado', 'Clásico'],
 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop&crop=face',
 now() - interval '12 days'),

(u9, 'barbero', 'Andrés Torres',
 'Especialista en coloración masculina. Mechas, balayage, decoloración para hombres. Rosario centro.',
 'Centro, Rosario', '+5493413456709', 'andres.color.barber',
 ARRAY['Mechas', 'Balayage', 'Decoloración', 'Tinte completo', 'Color fantasía'],
 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
 now() - interval '10 days'),

(u10, 'salon', 'El Rincón del Barbero',
 'Salón boutique en el corazón de Córdoba. Ambiente premium, música en vivo los viernes. Reservas por Instagram.',
 'Güemes, Córdoba', '+5493514456710', 'elrincon.barber.cba',
 ARRAY['Clásico', 'Degradé', 'Navaja', 'Barba completa', 'Peinado'],
 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=400&fit=crop',
 now() - interval '55 days'),

(u11, 'barbero', 'Leandro Díaz',
 'Barbero de celebridades y artistas. Portfolio con trabajos para marcas y publicidades. Reservas anticipadas.',
 'Palermo Hollywood, CABA', '+5491123456711', 'lean.premium.cuts',
 ARRAY['Degradé', 'Clásico', 'Diseño de barba', 'Barba francesa', 'Peinado'],
 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&crop=face',
 now() - interval '8 days'),

(u12, 'barbero', 'Martín Vargas',
 'Barbero mendocino con formación en Italia. Técnicas europeas aplicadas al corte latinoamericano.',
 'Godoy Cruz, Mendoza', '+5492614456712', 'martin.cuts.mendoza',
 ARRAY['Clásico', 'Afeitado navaja', 'Barba completa', 'Textura'],
 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop&crop=face',
 now() - interval '6 days'),

(u13, 'barbero', 'Emiliano Castro',
 'El mejor fade del norte argentino. Tucumán tiene talento, y yo lo demuestro corte a corte.',
 'San Miguel de Tucumán', '+5493814456713', 'emi.fade.tucuman',
 ARRAY['Degradé', 'Buzz cut', 'Afro', 'Perfilado'],
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
 now() - interval '4 days'),

(u14, 'salon', 'Studio Navajas',
 'Studio de barbería de alta gama en Recoleta. Solo con turno. Experiencia premium desde el ingreso.',
 'Recoleta, CABA', '+5491123456714', 'studionavajas.bsas',
 ARRAY['Afeitado navaja', 'Clásico', 'Barba completa', 'Keratina', 'Tratamiento capilar'],
 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=400&fit=crop',
 now() - interval '70 days'),

(u15, 'barbero', 'Ezequiel Romero',
 'Barbero platense, especializado en estudiantes universitarios. Precios accesibles, calidad profesional.',
 'La Plata, Buenos Aires', '+5492214456715', 'eze.barber.laplata',
 ARRAY['Degradé', 'Clásico', 'Buzz cut', 'Undercut', 'Perfilado'],
 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop&crop=face',
 now() - interval '2 days')

ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- TRABAJOS — 3 fotos de portfolio por barbero
-- =====================================================

INSERT INTO public.trabajos (user_id, imagen_url, descripcion, created_at) VALUES

-- Matías (u1)
(u1,'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop','Degradé bajo con barba perfilada',now()-interval'40 days'),
(u1,'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop','Corte clásico con raya',now()-interval'35 days'),
(u1,'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=600&fit=crop','Fade medio con textura',now()-interval'30 days'),

-- Lucas (u2)
(u2,'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=600&fit=crop','Barba completa estilo inglés',now()-interval'33 days'),
(u2,'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop','Undercut texturizado',now()-interval'28 days'),
(u2,'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop','Buzz cut con perfilado',now()-interval'20 days'),

-- Diego (u3)
(u3,'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop','Mullet moderno con fade',now()-interval'25 days'),
(u3,'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=600&fit=crop','Undercut con textura',now()-interval'18 days'),
(u3,'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=600&fit=crop','Color fantasía + corte',now()-interval'10 days'),

-- Nicolás (u4)
(u4,'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=600&fit=crop','Afro bien definido',now()-interval'20 days'),
(u4,'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop','Trenzas boxers',now()-interval'15 days'),
(u4,'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop','Degradé en pelo rizado',now()-interval'8 days'),

-- Julián (u5)
(u5,'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop','Corte clásico cordobés',now()-interval'18 days'),
(u5,'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop','Degradé con barba',now()-interval'12 days'),
(u5,'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=600&fit=crop','Perfilado de barba francesa',now()-interval'5 days'),

-- Barbería San Martín (u6)
(u6,'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=600&fit=crop','Vista del salón premium',now()-interval'50 days'),
(u6,'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop','Afeitado con navaja clásica',now()-interval'40 days'),
(u6,'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop','Trabajo del equipo',now()-interval'30 days'),

-- Franco (u7)
(u7,'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop','Fade de alta precisión',now()-interval'12 days'),
(u7,'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=600&fit=crop','Diseño geométrico en la sien',now()-interval'8 days'),
(u7,'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=600&fit=crop','Buzz cut con diseño',now()-interval'3 days'),

-- Gabriel (u8)
(u8,'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop','Corte texturizado surfer',now()-interval'10 days'),
(u8,'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=600&fit=crop','Peinado natural con sal',now()-interval'7 days'),
(u8,'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop','Largo con capas',now()-interval'3 days'),

-- Andrés (u9)
(u9,'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop','Balayage masculino',now()-interval'8 days'),
(u9,'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=600&fit=crop','Mechas platinadas',now()-interval'5 days'),
(u9,'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop','Color fantasía azul',now()-interval'2 days'),

-- El Rincón (u10)
(u10,'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=600&fit=crop','Interior del salón boutique',now()-interval'45 days'),
(u10,'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=600&fit=crop','Afeitado con toalla caliente',now()-interval'35 days'),
(u10,'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop','Corte clásico terminado',now()-interval'20 days'),

-- Leandro (u11)
(u11,'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop','Trabajo para sesión de fotos',now()-interval'6 days'),
(u11,'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop','Degradé premium con barba',now()-interval'4 days'),
(u11,'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop','Clásico elegante',now()-interval'1 day'),

-- Martín (u12)
(u12,'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=600&fit=crop','Afeitado estilo italiano',now()-interval'5 days'),
(u12,'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=600&fit=crop','Barba completa con aceite',now()-interval'3 days'),
(u12,'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop','Corte europeo con textura',now()-interval'1 day'),

-- Emiliano (u13)
(u13,'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop','Fade tucumano',now()-interval'3 days'),
(u13,'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=600&fit=crop','Buzz cut con perfilado',now()-interval'2 days'),
(u13,'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop','Afro definido',now()-interval'1 day'),

-- Studio Navajas (u14)
(u14,'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=600&fit=crop','Ambiente premium del studio',now()-interval'60 days'),
(u14,'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=600&fit=crop','Afeitado con navaja de colección',now()-interval'45 days'),
(u14,'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop','Tratamiento de barba completo',now()-interval'30 days'),

-- Ezequiel (u15)
(u15,'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop','Degradé universitario',now()-interval'2 days'),
(u15,'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop','Clásico con raya al costado',now()-interval'1 day'),
(u15,'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop','Undercut platense',now()-interval'12 hours');

END $$;
