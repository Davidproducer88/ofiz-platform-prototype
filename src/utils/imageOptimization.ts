/**
 * Utilidades para optimización de imágenes
 */

/**
 * Genera srcset para imágenes responsive
 */
export function generateSrcSet(baseUrl: string, widths: number[]): string {
  return widths
    .map((width) => `${baseUrl}?w=${width} ${width}w`)
    .join(', ');
}

/**
 * Genera sizes attribute para responsive images
 */
export function generateSizes(breakpoints: { query: string; size: string }[]): string {
  return breakpoints
    .map(({ query, size }) => `${query} ${size}`)
    .join(', ');
}

/**
 * Preload crítico de imágenes
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Lazy load batch de imágenes
 */
export function batchPreloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(preloadImage));
}

/**
 * Detecta si WebP es soportado
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;
  
  const elem = document.createElement('canvas');
  if (elem.getContext && elem.getContext('2d')) {
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
}

/**
 * Obtiene formato óptimo de imagen
 */
export function getOptimalFormat(): 'webp' | 'jpg' {
  return supportsWebP() ? 'webp' : 'jpg';
}
