/**
 * Image path normalization and fallback utility for production Vercel builds.
 * Vite only serves files in `public/` as root static assets in production builds.
 */

export const DEFAULT_FALLBACK_IMAGE = '/images/hero_us_barber_1790211473323.jpg';

export const SERVICE_DEFAULT_IMAGES: Record<string, string> = {
  'classic-haircut': '/images/classic-haircut.jpg',
  'beard-trim-sculpt': '/images/beard-trim.jpg',
  'hot-towel-shave': '/images/hot-towel-shave.jpg',
  'the-executive': '/images/executive-service.jpg',
  'senior-junior-cut': '/images/senior-junior-cut.jpg',
};

export function getImageUrl(url?: string | null, fallback = DEFAULT_FALLBACK_IMAGE): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }

  const cleanUrl = url.trim();

  // If path points to Vite dev-only /src/assets/images/, normalize to production /images/
  if (cleanUrl.startsWith('/src/assets/images/')) {
    return cleanUrl.replace('/src/assets/images/', '/images/');
  }
  if (cleanUrl.startsWith('src/assets/images/')) {
    return cleanUrl.replace('src/assets/images/', '/images/');
  }

  return cleanUrl;
}

export function getServiceImageUrl(service?: { slug?: string; name?: string; image_url?: string | null } | null): string {
  if (!service) return '/images/classic-haircut.jpg';

  if (service.image_url && typeof service.image_url === 'string' && service.image_url.trim() !== '') {
    return getImageUrl(service.image_url);
  }

  const slug = service.slug || service.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
  if (slug.includes('beard')) return SERVICE_DEFAULT_IMAGES['beard-trim-sculpt'];
  if (slug.includes('razor') || slug.includes('shave')) return SERVICE_DEFAULT_IMAGES['hot-towel-shave'];
  if (slug.includes('executive')) return SERVICE_DEFAULT_IMAGES['the-executive'];
  if (slug.includes('senior') || slug.includes('junior')) return SERVICE_DEFAULT_IMAGES['senior-junior-cut'];

  return SERVICE_DEFAULT_IMAGES[slug] || '/images/classic-haircut.jpg';
}

/**
 * Handle image error events by falling back to a known working static image.
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback = DEFAULT_FALLBACK_IMAGE
): void {
  const target = event.currentTarget;
  if (target.src !== fallback && !target.src.endsWith(fallback)) {
    target.src = fallback;
  }
}
