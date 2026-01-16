import { useSEO } from '@/hooks/useSEO';
import { JsonLd, generateOrganizationJsonLd, generateBreadcrumbJsonLd, OFIZ_ORGANIZATION } from './JsonLd';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: 'website' | 'article' | 'product' | 'profile';
  ogImage?: string;
  noindex?: boolean;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  breadcrumbs?: BreadcrumbItem[];
  jsonLd?: object | object[];
  includeOrganization?: boolean;
}

export const SEOHead = ({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage,
  noindex = false,
  keywords = [],
  author,
  publishedTime,
  modifiedTime,
  breadcrumbs,
  jsonLd,
  includeOrganization = false,
}: SEOHeadProps) => {
  // Apply SEO meta tags
  useSEO({
    title,
    description,
    canonical,
    ogType,
    ogImage,
    noindex,
    keywords,
    author,
    publishedTime,
    modifiedTime,
  });

  // Prepare JSON-LD data
  const jsonLdData: object[] = [];

  // Add Organization schema if requested
  if (includeOrganization) {
    jsonLdData.push(generateOrganizationJsonLd(OFIZ_ORGANIZATION));
  }

  // Add Breadcrumb schema if provided
  if (breadcrumbs && breadcrumbs.length > 0) {
    const breadcrumbItems = [
      { name: 'Inicio', url: '/' },
      ...breadcrumbs.map((item) => ({
        name: item.label,
        url: item.href || '#',
      })),
    ];
    jsonLdData.push(generateBreadcrumbJsonLd({ items: breadcrumbItems }));
  }

  // Add custom JSON-LD if provided
  if (jsonLd) {
    if (Array.isArray(jsonLd)) {
      jsonLdData.push(...jsonLd);
    } else {
      jsonLdData.push(jsonLd);
    }
  }

  // Only render JsonLd component if there's data
  if (jsonLdData.length === 0) {
    return null;
  }

  return <JsonLd data={jsonLdData} />;
};

export default SEOHead;
