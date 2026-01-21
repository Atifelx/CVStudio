import { MetadataRoute } from 'next';

/**
 * Dynamic Sitemap Generation
 * 
 * This generates an XML sitemap for search engines.
 * Access at: /sitemap.xml
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cvstudio.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // Add more pages here as your app grows
    // {
    //   url: `${siteUrl}/templates`,
    //   lastModified,
    //   changeFrequency: 'monthly',
    //   priority: 0.8,
    // },
    // {
    //   url: `${siteUrl}/examples`,
    //   lastModified,
    //   changeFrequency: 'monthly',
    //   priority: 0.7,
    // },
  ];
}
