/**
 * Image path normalization and fallback utility for production Vercel builds.
 * Vite only serves files in `public/` as root static assets in production builds.
 */

export const DEFAULT_FALLBACK_IMAGE = '/images/hero_us_barber_1790211473323.jpg';

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
