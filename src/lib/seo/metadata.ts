/**
 * SEO Metadata Utilities
 * Comprehensive SEO configuration for RAG Academy
 */

import type { Metadata, Viewport } from "next";

// ============================================
// Site Configuration
// ============================================

export const SITE_CONFIG = {
  name: "RAG Academy",
  tagline: "Master Retrieval-Augmented Generation Through Hands-On Practice",
  description: "Interactive, code-first learning platform for RAG (Retrieval-Augmented Generation). Practice with 250+ challenges covering embeddings, chunking, retrieval, evaluation, and production deployment.",
  url: "https://ragacademy.com",
  ogImage: "https://ragacademy.com/og-image.png",
  twitterHandle: "@ragacademy",
  locale: "en_US",
};

// ============================================
// Default Metadata
// ============================================

export const defaultMetadata: Metadata = {
  title: {
    default: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "RAG",
    "Retrieval-Augmented Generation",
    "LLM",
    "vector search",
    "embeddings",
    "chunking",
    "machine learning",
    "AI",
    "practice",
    "coding challenges",
    "learn RAG",
    "RAG tutorial",
    "vector database",
    "semantic search",
  ],
  authors: [{ name: "RAG Academy Team" }],
  creator: "RAG Academy",
  publisher: "RAG Academy",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: "RAG Academy - Master RAG Through Practice",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
    creator: SITE_CONFIG.twitterHandle,
  },
  alternates: {
    canonical: SITE_CONFIG.url,
    languages: {
      "en-US": "/en-US",
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  category: "education",
};

export const defaultViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

// ============================================
// Page-Specific Metadata Generators
// ============================================

export function generateChallengeMetadata(
  title: string,
  description: string,
  difficulty: string,
  slug: string
): Metadata {
  const url = `${SITE_CONFIG.url}/challenges/${slug}`;
  
  return {
    title: `${title} - RAG Challenge`,
    description: `${description} Practice this ${difficulty} level RAG challenge to improve your skills.`,
    openGraph: {
      title: `${title} | RAG Academy Challenge`,
      description,
      url,
      type: "article",
      images: [
        {
          url: `${SITE_CONFIG.url}/api/og/challenge?title=${encodeURIComponent(title)}&difficulty=${difficulty}`,
          width: 1200,
          height: 630,
          alt: `${title} - RAG Challenge`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | RAG Academy Challenge`,
      description,
      images: [`${SITE_CONFIG.url}/api/og/challenge?title=${encodeURIComponent(title)}&difficulty=${difficulty}`],
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generateLessonMetadata(
  title: string,
  description: string,
  phase: string,
  slug: string
): Metadata {
  const url = `${SITE_CONFIG.url}/learn/${phase}/${slug}`;
  
  return {
    title: `${title} - RAG Lesson`,
    description: `${description} Learn RAG concepts with hands-on examples.`,
    openGraph: {
      title: `${title} | RAG Academy Lesson`,
      description,
      url,
      type: "article",
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generateCategoryMetadata(
  category: string,
  description: string,
  challengeCount: number
): Metadata {
  const title = `${category} RAG Challenges`;
  
  return {
    title: `${title} - Practice ${challengeCount}+ Challenges`,
    description: `${description} Master ${category} with ${challengeCount}+ hands-on coding challenges.`,
    openGraph: {
      title: `${title} | RAG Academy`,
      description,
      type: "website",
    },
  };
}

// ============================================
// Structured Data Generators
// ============================================

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    sameAs: [
      "https://twitter.com/ragacademy",
      "https://github.com/ragacademy",
    ],
  };
}

export function generateCourseSchema(
  name: string,
  description: string,
  moduleCount: number,
  challengeCount: number
) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      sameAs: SITE_CONFIG.url,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "PT20H",
    },
    numberOfModules: moduleCount,
    educationalLevel: "intermediate",
    teaches: [
      "Retrieval-Augmented Generation",
      "Vector Search",
      "Embeddings",
      "Text Chunking",
      "RAG Evaluation",
    ],
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ============================================
// Sitemap Helpers
// ============================================

export interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

export function generateSitemapEntries(
  challenges: { slug: string; updatedAt?: string }[],
  lessons: { phase: string; slug: string; updatedAt?: string }[]
): SitemapEntry[] {
  const entries: SitemapEntry[] = [
    {
      url: SITE_CONFIG.url,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_CONFIG.url}/challenges`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_CONFIG.url}/learn`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Challenge pages
  for (const challenge of challenges) {
    entries.push({
      url: `${SITE_CONFIG.url}/challenges/${challenge.slug}`,
      lastModified: challenge.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Lesson pages
  for (const lesson of lessons) {
    entries.push({
      url: `${SITE_CONFIG.url}/learn/${lesson.phase}/${lesson.slug}`,
      lastModified: lesson.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}

// ============================================
// robots.txt Generator
// ============================================

export function generateRobotsTxt(): string {
  const lines = [
    "User-agent: *",
    "Allow: /",
    "",
    "# Sitemap",
    `Sitemap: ${SITE_CONFIG.url}/sitemap.xml`,
    "",
    "# Crawl-delay for bots",
    "Crawl-delay: 1",
    "",
    "# Disallow admin and API routes",
    "Disallow: /admin/",
    "Disallow: /api/",
    "Disallow: /_next/",
    "Disallow: /settings/billing/test/",
  ];

  return lines.join("\n");
}

// ============================================
// Meta Tag Helpers
// ============================================

export function generateMetaTags(
  title: string,
  description: string,
  image?: string
) {
  const metaImage = image || SITE_CONFIG.ogImage;

  return {
    title,
    meta: [
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: metaImage },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: metaImage },
    ],
  };
}

// ============================================
// JSON-LD Script Component
// ============================================

export function getJsonLdScript(data: Record<string, unknown>): string {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}
