import { supabase } from '@/integrations/supabase/client';

export const seedFeedData = async () => {
  try {
    console.log('🌱 Starting feed data seeding...');

    // Obtener masters existentes
    const { data: masters } = await supabase
      .from('masters')
      .select('id, business_name')
      .limit(5);

    if (!masters || masters.length === 0) {
      console.log('⚠️ No masters found, cannot seed feed data');
      return;
    }

    console.log(`Found ${masters.length} masters`);

    // Crear posts de ejemplo
    const posts = [
      {
        master_id: masters[0].id,
        type: 'tip',
        title: '5 Consejos para Mantener tu Hogar Limpio',
        content: 'Mantener un hogar limpio no tiene que ser complicado. Aquí te comparto mis mejores consejos después de años de experiencia en limpieza profesional...',
        category: 'cleaning' as const,
        media_urls: [],
      },
      {
        master_id: masters[1]?.id || masters[0].id,
        type: 'showcase',
        title: 'Antes y Después: Renovación Completa de Baño',
        content: 'Este proyecto tomó 3 días pero el resultado valió la pena. Transformamos completamente este baño antiguo en un espacio moderno y funcional.',
        category: 'plumbing' as const,
        media_urls: [],
      },
      {
        master_id: masters[2]?.id || masters[0].id,
        type: 'update',
        title: 'Nuevo Servicio de Mantenimiento Preventivo',
        content: '¡Ahora ofrezco paquetes de mantenimiento preventivo mensual! Incluye revisión completa de instalaciones eléctricas para evitar problemas futuros.',
        category: 'electricity' as const,
        media_urls: [],
      },
      {
        master_id: masters[3]?.id || masters[0].id,
        type: 'tip',
        title: 'Cómo Elegir la Pintura Correcta para tu Espacio',
        content: 'No todas las pinturas son iguales. Te explico las diferencias entre acabados mate, satinado y brillante, y cuándo usar cada uno.',
        category: 'painting' as const,
        media_urls: [],
      },
      {
        master_id: masters[4]?.id || masters[0].id,
        type: 'showcase',
        title: 'Instalación de Sistema de Riego Automático',
        content: 'Instalamos un sistema de riego inteligente que ahorra hasta 50% de agua. Perfecto para jardines grandes y quienes viajan frecuentemente.',
        category: 'gardening' as const,
        media_urls: [],
      }
    ];

    const { data: insertedPosts, error: postsError } = await supabase
      .from('feed_posts')
      .insert(posts)
      .select();

    if (postsError) {
      console.error('Error inserting posts:', postsError);
    } else {
      console.log(`✅ Created ${insertedPosts?.length || 0} posts`);
    }

    // Crear contenido patrocinado
    const sponsored = [
      {
        master_id: masters[0].id,
        type: 'service_ad',
        title: '¡Descuento Especial en Limpieza Profunda!',
        description: '20% de descuento en tu primer servicio de limpieza profunda. Válido hasta fin de mes.',
        media_url: null,
        cta_text: 'Reservar Ahora',
        cta_url: '/search-masters',
        category: 'cleaning' as const,
        budget: 500,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      },
      {
        master_id: masters[1]?.id || masters[0].id,
        type: 'featured',
        title: 'Profesional Verificado del Mes',
        description: 'Con más de 100 trabajos completados y calificación 5 estrellas. Especialista en reparaciones de plomería.',
        media_url: null,
        cta_text: 'Ver Perfil',
        cta_url: '/search-masters',
        category: 'plumbing' as const,
        budget: 1000,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      }
    ];

    const { data: insertedSponsored, error: sponsoredError } = await supabase
      .from('sponsored_content')
      .insert(sponsored)
      .select();

    if (sponsoredError) {
      console.error('Error inserting sponsored content:', sponsoredError);
    } else {
      console.log(`✅ Created ${insertedSponsored?.length || 0} sponsored items`);
    }

    console.log('🎉 Feed data seeding completed!');
    return { posts: insertedPosts, sponsored: insertedSponsored };
  } catch (error) {
    console.error('❌ Error seeding feed data:', error);
    throw error;
  }
};
