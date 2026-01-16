// SEO Data for all pages
export interface PageSEO {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
}

// Base keywords that apply to most pages
const BASE_KEYWORDS = [
  'servicios profesionales',
  'Uruguay',
  'Montevideo',
  'oficios',
  'profesionales verificados',
  'Ofiz',
];

// Home Page
export const HOME_SEO: PageSEO = {
  title: 'Ofiz - Profesionales Verificados para tu Hogar y Oficina',
  description: 'Encontrá profesionales verificados para tu hogar y oficina en Uruguay. Electricistas, plomeros, carpinteros, pintores y +150 oficios. Pagos seguros y garantía de satisfacción.',
  keywords: [
    ...BASE_KEYWORDS,
    'electricistas',
    'plomeros',
    'carpinteros',
    'pintores',
    'servicios hogar',
    'reparaciones',
    'construcción',
    'mantenimiento',
  ],
  canonical: '/',
};

// Search Masters Page
export const SEARCH_MASTERS_SEO: PageSEO = {
  title: 'Buscar Profesionales Verificados',
  description: 'Explorá nuestro directorio de profesionales verificados. Filtrá por categoría, ubicación, calificación y precio. Más de 8,000 profesionales disponibles en Uruguay.',
  keywords: [
    ...BASE_KEYWORDS,
    'buscar profesionales',
    'directorio oficios',
    'contratar servicios',
    'maestros verificados',
  ],
  canonical: '/search-masters',
};

// How It Works Page
export const HOW_IT_WORKS_SEO: PageSEO = {
  title: 'Cómo Funciona Ofiz - Guía Completa',
  description: 'Descubrí cómo funciona Ofiz en 6 simples pasos. Publicá tu encargo gratis, recibí presupuestos de profesionales verificados y pagá con seguridad.',
  keywords: [
    ...BASE_KEYWORDS,
    'cómo funciona',
    'guía',
    'tutorial',
    'contratar profesionales',
    'presupuestos gratis',
  ],
  canonical: '/how-it-works',
};

// Pricing Page
export const PRICING_SEO: PageSEO = {
  title: 'Precios y Planes - Transparencia Total',
  description: 'Conocé los precios y planes de Ofiz. Para clientes: publicación gratis, 5% comisión. Para profesionales: planes desde $0/mes con postulaciones incluidas.',
  keywords: [
    ...BASE_KEYWORDS,
    'precios',
    'planes',
    'tarifas',
    'comisiones',
    'suscripción profesionales',
    'costos',
  ],
  canonical: '/pricing',
};

// Guarantees Page
export const GUARANTEES_SEO: PageSEO = {
  title: 'Garantías de Ofiz - Tu Tranquilidad es Nuestra Prioridad',
  description: 'Conocé las garantías que ofrece Ofiz: pago seguro con escrow, profesionales verificados, soporte 24/7 y protección de datos. Tu proyecto está protegido.',
  keywords: [
    ...BASE_KEYWORDS,
    'garantías',
    'seguridad',
    'pago seguro',
    'escrow',
    'protección',
    'confianza',
  ],
  canonical: '/guarantees',
};

// Help Center Page
export const HELP_CENTER_SEO: PageSEO = {
  title: 'Centro de Ayuda - Soporte y FAQ',
  description: 'Centro de ayuda de Ofiz. Encontrá respuestas a preguntas frecuentes, guías de uso, soporte técnico y contacto. Estamos para ayudarte.',
  keywords: [
    ...BASE_KEYWORDS,
    'ayuda',
    'soporte',
    'FAQ',
    'preguntas frecuentes',
    'contacto',
    'asistencia',
  ],
  canonical: '/help-center',
};

// About Page
export const ABOUT_SEO: PageSEO = {
  title: 'Sobre Nosotros - Nuestra Historia y Misión',
  description: 'Conocé la historia de Ofiz, nuestra misión de democratizar el acceso a servicios profesionales y el equipo detrás de la plataforma líder en Uruguay.',
  keywords: [
    ...BASE_KEYWORDS,
    'sobre nosotros',
    'historia',
    'misión',
    'visión',
    'equipo',
    'empresa uruguaya',
  ],
  canonical: '/about',
};

// Contact Page
export const CONTACT_SEO: PageSEO = {
  title: 'Contacto - Hablemos',
  description: 'Contactá a Ofiz. Envianos tus consultas, sugerencias o comentarios. Nuestro equipo está disponible para ayudarte. Respuesta en menos de 24 horas.',
  keywords: [
    ...BASE_KEYWORDS,
    'contacto',
    'soporte',
    'consultas',
    'atención al cliente',
    'email',
  ],
  canonical: '/contact',
};

// Blog Page
export const BLOG_SEO: PageSEO = {
  title: 'Blog - Consejos, Guías y Tendencias',
  description: 'Blog de Ofiz con consejos para elegir profesionales, guías de renovación, tendencias en decoración, mantenimiento del hogar y casos de éxito.',
  keywords: [
    ...BASE_KEYWORDS,
    'blog',
    'consejos',
    'guías',
    'tendencias',
    'renovación',
    'decoración',
    'mantenimiento hogar',
  ],
  canonical: '/blog',
};

// Terms Page
export const TERMS_SEO: PageSEO = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso de la plataforma Ofiz. Conocé tus derechos y obligaciones como usuario de nuestros servicios.',
  keywords: ['Ofiz', 'términos', 'condiciones', 'legal', 'uso', 'plataforma'],
  canonical: '/terms',
};

// Privacy Page
export const PRIVACY_SEO: PageSEO = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad de Ofiz. Conocé cómo recopilamos, usamos y protegemos tus datos personales. Tu privacidad es nuestra prioridad.',
  keywords: ['Ofiz', 'privacidad', 'datos personales', 'protección', 'GDPR', 'cookies'],
  canonical: '/privacy',
};

// Sitemap Page
export const SITEMAP_SEO: PageSEO = {
  title: 'Mapa del Sitio',
  description: 'Mapa completo del sitio Ofiz. Navegá fácilmente por todas las secciones: servicios, profesionales, blog, ayuda y más.',
  keywords: ['Ofiz', 'mapa del sitio', 'sitemap', 'navegación'],
  canonical: '/sitemap',
};

// Tools for Professionals Page
export const TOOLS_PROFESSIONALS_SEO: PageSEO = {
  title: 'Herramientas para Profesionales',
  description: 'Descubrí las herramientas que Ofiz ofrece a los profesionales: gestión de clientes, calendario, facturación, estadísticas y más. Hacé crecer tu negocio.',
  keywords: [
    ...BASE_KEYWORDS,
    'herramientas',
    'profesionales',
    'gestión',
    'calendario',
    'facturación',
    'estadísticas',
  ],
  canonical: '/herramientas-profesionales',
};

// Premium Plans Page
export const PREMIUM_PLANS_SEO: PageSEO = {
  title: 'Planes Premium para Profesionales',
  description: 'Planes premium de Ofiz para profesionales. Más postulaciones, mejor visibilidad, estadísticas avanzadas y soporte prioritario. Elegí tu plan.',
  keywords: [
    ...BASE_KEYWORDS,
    'planes premium',
    'suscripción',
    'profesionales',
    'postulaciones',
    'visibilidad',
  ],
  canonical: '/planes-premium',
};

// Demo Page
export const DEMO_SEO: PageSEO = {
  title: 'Demo Interactiva - Probá Ofiz',
  description: 'Probá Ofiz con nuestra demo interactiva. Explorá las funcionalidades de la plataforma sin necesidad de registrarte. Descubrí cómo podemos ayudarte.',
  keywords: [
    ...BASE_KEYWORDS,
    'demo',
    'prueba',
    'funcionalidades',
    'tour',
    'gratis',
  ],
  canonical: '/demo',
};

// Dossier Maestros Page
export const DOSSIER_MAESTROS_SEO: PageSEO = {
  title: 'Dossier para Profesionales - Por Qué Unirte a Ofiz',
  description: 'Descubrí por qué miles de profesionales eligieron Ofiz. Más clientes, pagos seguros, herramientas de gestión y crecimiento garantizado.',
  keywords: [
    ...BASE_KEYWORDS,
    'dossier',
    'profesionales',
    'maestros',
    'beneficios',
    'registrarse',
  ],
  canonical: '/dossier-maestros',
};

// Dossier Empresas Page
export const DOSSIER_EMPRESAS_SEO: PageSEO = {
  title: 'Dossier para Empresas - Soluciones Corporativas',
  description: 'Soluciones corporativas de Ofiz para empresas. Contratá profesionales para tus proyectos, gestión centralizada, facturación y analytics.',
  keywords: [
    ...BASE_KEYWORDS,
    'empresas',
    'corporativo',
    'B2B',
    'contratación',
    'gestión',
    'proyectos',
  ],
  canonical: '/dossier-empresas',
};

// Pitch Deck Page
export const PITCH_DECK_SEO: PageSEO = {
  title: 'Pitch Deck - Inversores',
  description: 'Presentación para inversores de Ofiz. Conocé nuestro modelo de negocio, métricas, equipo y oportunidad de inversión en el mercado de servicios profesionales.',
  keywords: ['Ofiz', 'inversores', 'pitch deck', 'inversión', 'startup', 'Uruguay'],
  canonical: '/pitch-deck',
};

// Category SEO generator
export const generateCategorySEO = (
  categoryLabel: string,
  categoryDescription: string,
  categoryValue: string
): PageSEO => ({
  title: `${categoryLabel} en Uruguay - Profesionales Verificados`,
  description: `Encontrá profesionales de ${categoryLabel.toLowerCase()} verificados en Uruguay. ${categoryDescription}. Presupuestos gratis, pagos seguros y garantía de satisfacción.`,
  keywords: [
    ...BASE_KEYWORDS,
    categoryLabel.toLowerCase(),
    categoryDescription.toLowerCase(),
    `contratar ${categoryLabel.toLowerCase()}`,
    `${categoryLabel.toLowerCase()} Montevideo`,
  ],
  canonical: `/search-masters?category=${categoryValue}`,
});

// Blog Post SEO generator
export const generateBlogPostSEO = (
  title: string,
  excerpt: string,
  id: string,
  category: string
): PageSEO => ({
  title: title,
  description: excerpt,
  keywords: [
    ...BASE_KEYWORDS,
    'blog',
    category.toLowerCase(),
    ...title.toLowerCase().split(' ').filter(w => w.length > 4),
  ],
  canonical: `/blog/${id}`,
});

// Professional Profile SEO generator
export const generateProfessionalSEO = (
  name: string,
  category: string,
  city: string,
  rating: number
): PageSEO => ({
  title: `${name} - ${category} en ${city}`,
  description: `Perfil profesional de ${name}, ${category.toLowerCase()} en ${city}. Calificación: ${rating}/5 estrellas. Contactá ahora para tu proyecto.`,
  keywords: [
    ...BASE_KEYWORDS,
    category.toLowerCase(),
    city.toLowerCase(),
    `${category.toLowerCase()} ${city.toLowerCase()}`,
  ],
  canonical: `/professional/${name.toLowerCase().replace(/\s+/g, '-')}`,
});
