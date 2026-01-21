import { MetadataRoute } from 'next';

/**
 * Dynamic Robots.txt Generation
 * 
 * This generates robots.txt for search engines.
 * Access at: /robots.txt
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cvstudio.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Disallow admin or API routes if you add them later
        // disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
