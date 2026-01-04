// SEO Configuration and Utilities

export const siteConfig = {
  name: 'Gibbon Nutrition',
  description: 'Fuel your fitness journey with Gibbon Nutrition. Lab-tested, FSSAI certified supplements including Whey Protein, Pre-Workout, Mass Gainers, BCAAs & more. Made in India.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://gibbonnutrition.com',
  ogImage: '/og-image.jpg',
  links: {
    instagram: 'https://instagram.com/gibbonnutrition',
    facebook: 'https://facebook.com/gibbonnutrition',
    twitter: 'https://twitter.com/gibbonnutrition',
  },
  creator: 'Gibbon Nutrition',
  keywords: [
    'Gibbon Nutrition',
    'Whey Protein',
    'Pre-Workout',
    'BCAA',
    'Mass Gainer',
    'Fitness Supplements',
    'Bodybuilding',
    'Protein Powder India',
    'Gym Supplements',
    'Sports Nutrition',
    'Creatine',
    'Fat Burner',
    'Weight Loss',
    'Muscle Building',
    'FSSAI Certified',
    'Lab Tested Supplements',
  ],
}

// Generate Product JSON-LD Schema
export function generateProductSchema(product: {
  title: string
  description?: string
  handle: string
  images?: { src: string }[]
  variants?: { price: number; compareAtPrice?: number; sku?: string; inventoryQty?: number }[]
  reviews?: { star: number }[]
  vendor?: string
  productCategory?: string
}) {
  const price = product.variants?.[0]?.price || 0
  const compareAtPrice = product.variants?.[0]?.compareAtPrice
  const sku = product.variants?.[0]?.sku || product.handle
  const inStock = (product.variants?.[0]?.inventoryQty ?? 10) > 0
  const avgRating = product.reviews?.length 
    ? product.reviews.reduce((acc, r) => acc + r.star, 0) / product.reviews.length 
    : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || `${product.title} - Premium quality supplement from Gibbon Nutrition`,
    image: product.images?.map(img => img.src) || [],
    sku: sku,
    brand: {
      '@type': 'Brand',
      name: product.vendor || 'Gibbon Nutrition',
    },
    category: product.productCategory || 'Supplements',
    offers: {
      '@type': 'Offer',
      url: `${siteConfig.url}/products/${product.handle}`,
      priceCurrency: 'INR',
      price: price,
      ...(compareAtPrice && { priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Gibbon Nutrition',
      },
    },
    ...(avgRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: product.reviews?.length || 0,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  }
}

// Generate Organization JSON-LD Schema
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Gibbon Nutrition',
    url: siteConfig.url,
    logo: `${siteConfig.url}/GibbonLogoEccom.png`,
    description: siteConfig.description,
    sameAs: [
      siteConfig.links.instagram,
      siteConfig.links.facebook,
      siteConfig.links.twitter,
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-98765-43210',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Mumbai',
      addressRegion: 'Maharashtra',
      addressCountry: 'IN',
    },
  }
}

// Generate WebSite JSON-LD Schema with SearchAction
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Gibbon Nutrition',
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// Generate BreadcrumbList JSON-LD Schema
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// Generate Collection/Category JSON-LD Schema
export function generateCollectionSchema(collection: {
  title: string
  handle: string
  description?: string
  products?: { title: string; handle: string; images?: { src: string }[]; variants?: { price: number }[] }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.title,
    description: collection.description || `Shop ${collection.title} at Gibbon Nutrition`,
    url: `${siteConfig.url}/collections/${collection.handle}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: collection.products?.slice(0, 10).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.title,
          url: `${siteConfig.url}/products/${product.handle}`,
          image: product.images?.[0]?.src,
          offers: {
            '@type': 'Offer',
            price: product.variants?.[0]?.price || 0,
            priceCurrency: 'INR',
          },
        },
      })) || [],
    },
  }
}

// Generate Article/Blog JSON-LD Schema
export function generateArticleSchema(article: {
  title: string
  handle: string
  content?: string
  excerpt?: string
  image?: string
  author?: string
  publishedAt?: string
  updatedAt?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.content?.slice(0, 160),
    image: article.image || `${siteConfig.url}/og-image.jpg`,
    url: `${siteConfig.url}/blog/${article.handle}`,
    datePublished: article.publishedAt || new Date().toISOString(),
    dateModified: article.updatedAt || article.publishedAt || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: article.author || 'Gibbon Nutrition Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Gibbon Nutrition',
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/GibbonLogoEccom.png`,
      },
    },
  }
}

// Generate FAQ JSON-LD Schema
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// Generate Local Business Schema
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    '@id': `${siteConfig.url}/#store`,
    name: 'Gibbon Nutrition',
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: '+91-98765-43210',
    email: 'support@gibbonnutrition.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Mumbai',
      addressLocality: 'Mumbai',
      addressRegion: 'Maharashtra',
      postalCode: '400001',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '19.0760',
      longitude: '72.8777',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
    priceRange: '₹₹',
  }
}
