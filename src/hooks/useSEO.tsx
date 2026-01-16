import { useEffect } from 'react';

interface SEOProps {
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
}

const BASE_URL = 'https://www.ofiz.com.uy';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;
const SITE_NAME = 'Ofiz';
const TWITTER_HANDLE = '@ofiz_uy';

export const useSEO = ({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
  keywords = [],
  author = 'Ofiz',
  publishedTime,
  modifiedTime,
}: SEOProps) => {
  useEffect(() => {
    // Title - max 60 chars for optimal display
    const fullTitle = title.length > 50 
      ? title 
      : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    // Helper to update or create meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to update or create link tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Basic Meta Tags
    setMetaTag('description', description);
    setMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMetaTag('author', author);
    
    if (keywords.length > 0) {
      setMetaTag('keywords', keywords.join(', '));
    }

    // Canonical URL
    const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL;
    setLinkTag('canonical', canonicalUrl);

    // Open Graph Tags
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:url', canonicalUrl, true);
    setMetaTag('og:site_name', SITE_NAME, true);
    setMetaTag('og:image', ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`, true);
    setMetaTag('og:image:width', '1200', true);
    setMetaTag('og:image:height', '630', true);
    setMetaTag('og:locale', 'es_UY', true);

    // Twitter Card Tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:site', TWITTER_HANDLE);
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`);

    // Article specific meta (for blog posts)
    if (ogType === 'article' && publishedTime) {
      setMetaTag('article:published_time', publishedTime, true);
      if (modifiedTime) {
        setMetaTag('article:modified_time', modifiedTime, true);
      }
      setMetaTag('article:author', author, true);
    }

    // Cleanup function to reset on unmount
    return () => {
      // Keep the meta tags as they are - next page will update them
    };
  }, [title, description, canonical, ogType, ogImage, noindex, keywords, author, publishedTime, modifiedTime]);
};

export const generateSEOTitle = (pageTitle: string, maxLength = 50): string => {
  if (pageTitle.length <= maxLength) {
    return `${pageTitle} | Ofiz`;
  }
  return pageTitle.substring(0, maxLength - 3) + '...';
};

export default useSEO;
