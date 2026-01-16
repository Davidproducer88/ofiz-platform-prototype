import { useEffect } from 'react';

const BASE_URL = 'https://www.ofiz.com.uy';

// Organization Schema
export interface OrganizationSchema {
  name: string;
  url: string;
  logo: string;
  description: string;
  address?: {
    streetAddress?: string;
    addressLocality: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry: string;
  };
  contactPoint?: {
    telephone?: string;
    email?: string;
    contactType: string;
  };
  sameAs?: string[];
}

// LocalBusiness Schema
export interface LocalBusinessSchema extends OrganizationSchema {
  priceRange?: string;
  openingHours?: string[];
  geo?: {
    latitude: number;
    longitude: number;
  };
  areaServed?: string[];
}

// Product Schema
export interface ProductSchema {
  name: string;
  description: string;
  image?: string;
  sku?: string;
  brand?: string;
  price: number;
  priceCurrency: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  seller?: string;
  rating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

// Service Schema
export interface ServiceSchema {
  name: string;
  description: string;
  provider: string;
  areaServed?: string[];
  category?: string;
  image?: string;
  price?: {
    minPrice?: number;
    maxPrice?: number;
    currency: string;
  };
}

// Review Schema
export interface ReviewSchema {
  author: string;
  datePublished: string;
  reviewBody: string;
  ratingValue: number;
  itemReviewed: {
    name: string;
    type: 'Product' | 'Service' | 'LocalBusiness';
  };
}

// FAQ Schema
export interface FAQSchema {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

// Breadcrumb Schema
export interface BreadcrumbSchema {
  items: Array<{
    name: string;
    url: string;
  }>;
}

// Article Schema
export interface ArticleSchema {
  headline: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  publisher?: string;
}

// Generate Organization JSON-LD
export const generateOrganizationJsonLd = (data: OrganizationSchema): object => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: data.name,
  url: data.url,
  logo: data.logo,
  description: data.description,
  ...(data.address && {
    address: {
      '@type': 'PostalAddress',
      ...data.address,
    },
  }),
  ...(data.contactPoint && {
    contactPoint: {
      '@type': 'ContactPoint',
      ...data.contactPoint,
    },
  }),
  ...(data.sameAs && { sameAs: data.sameAs }),
});

// Generate LocalBusiness JSON-LD
export const generateLocalBusinessJsonLd = (data: LocalBusinessSchema): object => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: data.name,
  url: data.url,
  logo: data.logo,
  description: data.description,
  ...(data.priceRange && { priceRange: data.priceRange }),
  ...(data.openingHours && { openingHours: data.openingHours }),
  ...(data.geo && {
    geo: {
      '@type': 'GeoCoordinates',
      latitude: data.geo.latitude,
      longitude: data.geo.longitude,
    },
  }),
  ...(data.areaServed && { areaServed: data.areaServed }),
  ...(data.address && {
    address: {
      '@type': 'PostalAddress',
      ...data.address,
    },
  }),
  ...(data.contactPoint && {
    contactPoint: {
      '@type': 'ContactPoint',
      ...data.contactPoint,
    },
  }),
});

// Generate Product JSON-LD
export const generateProductJsonLd = (data: ProductSchema): object => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: data.name,
  description: data.description,
  ...(data.image && { image: data.image }),
  ...(data.sku && { sku: data.sku }),
  ...(data.brand && {
    brand: {
      '@type': 'Brand',
      name: data.brand,
    },
  }),
  offers: {
    '@type': 'Offer',
    price: data.price,
    priceCurrency: data.priceCurrency,
    availability: `https://schema.org/${data.availability || 'InStock'}`,
    ...(data.seller && {
      seller: {
        '@type': 'Organization',
        name: data.seller,
      },
    }),
  },
  ...(data.rating && {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: data.rating.ratingValue,
      reviewCount: data.rating.reviewCount,
    },
  }),
});

// Generate Service JSON-LD
export const generateServiceJsonLd = (data: ServiceSchema): object => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: data.name,
  description: data.description,
  provider: {
    '@type': 'Organization',
    name: data.provider,
  },
  ...(data.areaServed && { areaServed: data.areaServed }),
  ...(data.category && { serviceType: data.category }),
  ...(data.image && { image: data.image }),
  ...(data.price && {
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: data.price.minPrice,
      highPrice: data.price.maxPrice,
      priceCurrency: data.price.currency,
    },
  }),
});

// Generate FAQ JSON-LD
export const generateFAQJsonLd = (data: FAQSchema): object => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: data.questions.map((q) => ({
    '@type': 'Question',
    name: q.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: q.answer,
    },
  })),
});

// Generate Breadcrumb JSON-LD
export const generateBreadcrumbJsonLd = (data: BreadcrumbSchema): object => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: data.items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
  })),
});

// Generate Article JSON-LD
export const generateArticleJsonLd = (data: ArticleSchema): object => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: data.headline,
  description: data.description,
  author: {
    '@type': 'Person',
    name: data.author,
  },
  datePublished: data.datePublished,
  ...(data.dateModified && { dateModified: data.dateModified }),
  ...(data.image && { image: data.image }),
  publisher: {
    '@type': 'Organization',
    name: data.publisher || 'Ofiz',
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/favicon.png`,
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': BASE_URL,
  },
});

// Generate WebSite JSON-LD with SearchAction
export const generateWebSiteJsonLd = (): object => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Ofiz',
  url: BASE_URL,
  description: 'Conectamos clientes con profesionales verificados de oficios manuales y técnicos en Uruguay',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/search-masters?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});

// JSON-LD Component
interface JsonLdProps {
  data: object | object[];
}

export const JsonLd = ({ data }: JsonLdProps) => {
  useEffect(() => {
    const scripts: HTMLScriptElement[] = [];
    const dataArray = Array.isArray(data) ? data : [data];
    
    dataArray.forEach((item, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = `json-ld-${index}`;
      script.textContent = JSON.stringify(item);
      document.head.appendChild(script);
      scripts.push(script);
    });

    return () => {
      scripts.forEach((script) => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, [data]);

  return null;
};

// Default Organization Data for Ofiz
export const OFIZ_ORGANIZATION: OrganizationSchema = {
  name: 'Ofiz',
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.png`,
  description: 'Plataforma líder en Uruguay que conecta clientes con profesionales verificados de oficios manuales y técnicos. Servicios de construcción, electricidad, plomería, carpintería y más.',
  address: {
    addressLocality: 'Montevideo',
    addressCountry: 'UY',
  },
  contactPoint: {
    email: 'contacto@ofiz.com.uy',
    contactType: 'customer service',
  },
  sameAs: [
    'https://twitter.com/ofiz_uy',
    'https://www.instagram.com/ofiz_uy',
    'https://www.linkedin.com/company/ofiz-uy',
    'https://www.facebook.com/ofizuy',
  ],
};

export default JsonLd;
