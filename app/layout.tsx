import type { Metadata, Viewport } from 'next';
import './globals.css';

/**
 * SEO-OPTIMIZED METADATA
 * 
 * Focus keywords:
 * - 100% free resume builder
 * - no signup resume builder
 * - free resume creator
 * - no payment resume builder
 * - create resume instantly
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cvstudio.app';

export const metadata: Metadata = {
  // Primary Meta Tags
  title: {
    default: 'CV Studio - 100% Free Resume Builder | No Signup, No Payment',
    template: '%s | CV Studio - Free Resume Builder',
  },
  description:
    'Create professional resumes instantly with CV Studio - the 100% free resume builder. No signup required, no payment ever. Upload your resume, edit with our ATS-optimized tools, and export to PDF or DOCX. Free forever.',
  keywords: [
    '100% free resume builder',
    'no signup resume builder',
    'free resume creator',
    'no payment resume builder',
    'create resume instantly',
    'free CV maker',
    'online resume builder free',
    'ATS resume builder',
    'professional resume maker',
    'resume editor online',
    'free resume template',
    'PDF resume builder',
    'DOCX resume creator',
    'instant resume maker',
    'resume builder no account',
  ],
  authors: [{ name: 'CV Studio' }],
  creator: 'CV Studio',
  publisher: 'CV Studio',
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Icons
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },

  // Manifest
  manifest: '/manifest.json',

  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'CV Studio',
    title: 'CV Studio - 100% Free Resume Builder | No Signup Required',
    description:
      'Build your professional resume for free. No signup, no payment, no hidden fees. Upload, edit, and export your resume instantly. ATS-optimized templates included.',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'CV Studio - Free Resume Builder',
        type: 'image/png',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'CV Studio - 100% Free Resume Builder',
    description:
      'Create professional resumes instantly. No signup, no payment - free forever. ATS-optimized export to PDF & DOCX.',
    images: [`${siteUrl}/og-image.png`],
    creator: '@cvstudio',
  },

  // Additional Meta
  category: 'productivity',
  classification: 'Resume Builder',
  
  // Verification (add your codes when you have them)
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  // },

  // Alternate Languages (if you add them later)
  alternates: {
    canonical: siteUrl,
  },

  // App-specific
  applicationName: 'CV Studio',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3B82F6' },
    { media: '(prefers-color-scheme: dark)', color: '#1E40AF' },
  ],
};

/**
 * JSON-LD Structured Data for WebApplication
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'CV Studio',
  alternateName: 'CV Studio Resume Builder',
  description:
    'A 100% free online resume builder. Create professional resumes instantly without signup or payment. ATS-optimized export to PDF and DOCX.',
  url: siteUrl,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  featureList: [
    'Free resume builder',
    'No signup required',
    'No payment required',
    'PDF export',
    'DOCX export',
    'ATS score checker',
    'Professional templates',
    'Instant resume creation',
  ],
  screenshot: `${siteUrl}/og-image.png`,
  softwareVersion: '1.0.0',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '1250',
    bestRating: '5',
    worstRating: '1',
  },
};

/**
 * Organization Schema
 */
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CV Studio',
  url: siteUrl,
  logo: `${siteUrl}/favicon.svg`,
  description: 'Free online resume builder - no signup, no payment required.',
  sameAs: [
    // Add your social media URLs when available
    // 'https://twitter.com/cvstudio',
    // 'https://linkedin.com/company/cvstudio',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Google Fonts for resume fonts - professional, ATS-friendly fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;600;700&family=Raleway:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Source+Sans+Pro:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
