# Guía para Poblar la Base de Datos con Datos de Ejemplo

## ⚠️ Importante
Los perfiles de masters requieren usuarios autenticados en `auth.users`. Estos datos deben crearse a través del panel de autenticación de Supabase.

## Opción 1: Crear Usuarios Manualmente (Recomendado para Testing)

1. Ve al panel de Supabase → Authentication → Users
2. Crea usuarios con estos correos:
   - master1@test.com (Carlos Rodríguez - Fontanero)
   - master2@test.com (Laura Sánchez - Electricista)
   - master3@test.com (Miguel Pérez - Carpintero)
   - master4@test.com (Ana Jiménez - Pintora)
   - master5@test.com (Francisco Gómez - Limpieza)

3. Después de crear cada usuario, ejecuta este SQL en el SQL Editor:

\`\`\`sql
-- Actualizar perfil del usuario con datos del master
UPDATE public.profiles 
SET 
  full_name = 'Carlos Rodríguez',
  user_type = 'master',
  phone = '+34-600-123-456',
  city = 'Madrid',
  avatar_url = '/avatars/master-plumber-1.jpg',
  email_verified = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'master1@test.com');

-- Crear entrada en masters
INSERT INTO public.masters (id, business_name, description, hourly_rate, experience_years, is_verified, rating, total_reviews)
SELECT 
  id,
  'Fontanería Rodríguez',
  'Experto en instalaciones de fontanería residencial y comercial. Reparaciones de emergencia 24/7.',
  45.00,
  15,
  true,
  4.8,
  127
FROM auth.users WHERE email = 'master1@test.com'
ON CONFLICT (id) DO NOTHING;

-- Crear servicios del master
INSERT INTO public.services (master_id, title, category, description, price, duration_minutes, status)
SELECT 
  id,
  'Instalación de grifería',
  'plumbing',
  'Instalación profesional de grifos de cocina y baño con garantía de 2 años.',
  80.00,
  90,
  'active'
FROM auth.users WHERE email = 'master1@test.com';

INSERT INTO public.services (master_id, title, category, description, price, duration_minutes, status)
SELECT 
  id,
  'Reparación de fugas',
  'plumbing',
  'Detección y reparación de fugas en tuberías y conexiones.',
  95.00,
  120,
  'active'
FROM auth.users WHERE email = 'master1@test.com';

INSERT INTO public.services (master_id, title, category, description, price, duration_minutes, status)
SELECT 
  id,
  'Desatasco de tuberías',
  'plumbing',
  'Limpieza profesional de tuberías obstruidas con equipos especializados.',
  70.00,
  60,
  'active'
FROM auth.users WHERE email = 'master1@test.com';
\`\`\`

Repite este proceso para cada master cambiando:
- El email del usuario
- Los datos del perfil (nombre, teléfono, ciudad, avatar)
- Los datos del master (business_name, descripción, tarifa, etc.)
- La categoría y descripción de los servicios

## Opción 2: Script SQL Completo para Desarrollo

Si quieres poblar rápidamente con datos de prueba, puedes ejecutar este script en el SQL Editor de Supabase. Este script creará usuarios directamente en auth.users (solo funciona si tienes permisos de administrador):

\`\`\`sql
-- ADVERTENCIA: Este script solo funciona con permisos de servicio
-- NO usar en producción

-- Para desarrollo local, puedes usar este script

-- Ejemplo de inserción de datos de prueba usando la API de Admin
-- Debes ejecutar esto desde una Edge Function con el rol de servicio
\`\`\`

## Opción 3: Script de Node.js para Poblar Datos

Crea un archivo `seed.js`:

\`\`\`javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'TU_SUPABASE_URL',
  'TU_SERVICE_ROLE_KEY' // ⚠️ NUNCA compartir esta key
);

const masters = [
  {
    email: 'master1@test.com',
    password: 'Test123!',
    fullName: 'Carlos Rodríguez',
    phone: '+34-600-123-456',
    city: 'Madrid',
    businessName: 'Fontanería Rodríguez',
    description: 'Experto en instalaciones de fontanería residencial y comercial.',
    hourlyRate: 45.00,
    experienceYears: 15,
    category: 'plumbing',
    services: [
      {
        title: 'Instalación de grifería',
        description: 'Instalación profesional de grifos con garantía.',
        price: 80.00,
        duration: 90
      },
      {
        title: 'Reparación de fugas',
        description: 'Detección y reparación de fugas.',
        price: 95.00,
        duration: 120
      }
    ]
  }
  // ... más masters
];

async function seedDatabase() {
  for (const master of masters) {
    // Crear usuario
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: master.email,
      password: master.password,
      email_confirm: true,
      user_metadata: {
        full_name: master.fullName
      }
    });

    if (userError) {
      console.error('Error creating user:', userError);
      continue;
    }

    // Actualizar perfil
    await supabase
      .from('profiles')
      .update({
        full_name: master.fullName,
        user_type: 'master',
        phone: master.phone,
        city: master.city,
        email_verified: true
      })
      .eq('id', user.id);

    // Crear master
    await supabase
      .from('masters')
      .insert({
        id: user.id,
        business_name: master.businessName,
        description: master.description,
        hourly_rate: master.hourlyRate,
        experience_years: master.experienceYears,
        is_verified: true,
        rating: 4.8,
        total_reviews: 100
      });

    // Crear servicios
    for (const service of master.services) {
      await supabase
        .from('services')
        .insert({
          master_id: user.id,
          title: service.title,
          category: master.category,
          description: service.description,
          price: service.price,
          duration_minutes: service.duration,
          status: 'active'
        });
    }

    console.log(`✓ Created master: ${master.fullName}`);
  }
}

seedDatabase();
\`\`\`

Ejecuta con: `node seed.js`

## Avatares Disponibles

Los siguientes avatares han sido generados y están disponibles en `/src/assets/avatars/`:

- master-plumber-1.jpg - Fontanero
- master-electrician-1.jpg - Electricista
- master-carpenter-1.jpg - Carpintero
- master-painter-1.jpg - Pintora
- master-cleaning-1.jpg - Limpieza
- master-gardener-1.jpg - Jardinera
- master-appliance-1.jpg - Reparación de electrodomésticos
- master-computer-1.jpg - Reparación de computadoras

## Imágenes de Servicios

Imágenes disponibles en `/src/assets/services/`:

- plumbing-1.jpg
- electricity-1.jpg
- carpentry-1.jpg
- painting-1.jpg
- cleaning-1.jpg
- gardening-1.jpg
- appliance-1.jpg
- computer-1.jpg

## Próximos Pasos

1. Crea los usuarios de ejemplo usando cualquiera de las opciones anteriores
2. Los avatares generados están en `src/assets/avatars/`
3. Las imágenes de servicios están en `src/assets/services/`
4. La tabla `master_portfolio` está lista para galería de trabajos
5. Sistema de notificaciones y chat ya implementado

## Notas de Seguridad

- ⚠️ NUNCA uses el service_role_key en el frontend
- Solo crear usuarios de prueba en entornos de desarrollo
- Eliminar datos de prueba antes de producción
