import type { FC } from 'react'

// ---------- FAQPage ------------------------------------------------
interface FAQItem {
  question: string
  answer: string
}

interface FAQPageJsonLdProps {
  questions: FAQItem[]
}

export const FAQPageJsonLd: FC<FAQPageJsonLdProps> = ({ questions }) => {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  )
}

// ---------- SoftwareApplication ------------------------------------
interface SoftwareApplicationJsonLdProps {
  name: string
  url: string
  description: string
  offers: {
    price: string
    priceCurrency: string
  }
  aggregateRating?: {
    ratingValue: string
    ratingCount: string
  }
  inLanguage?: string
}

export const SoftwareApplicationJsonLd: FC<SoftwareApplicationJsonLdProps> = ({
  name,
  url,
  description,
  offers,
  aggregateRating,
  inLanguage,
}) => {
  const json: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    url,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Any',
    description,
    offers: {
      '@type': 'Offer',
      price: offers.price,
      priceCurrency: offers.priceCurrency,
    },
  }

  if (aggregateRating) {
    json.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: aggregateRating.ratingValue,
      ratingCount: aggregateRating.ratingCount,
    }
  }

  if (inLanguage) {
    json.inLanguage = inLanguage
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  )
}

// ---------- Organization -------------------------------------------
interface OrganizationJsonLdProps {
  name: string
  url: string
  logo: string
  description?: string
  sameAs?: string[]
}

export const OrganizationJsonLd: FC<OrganizationJsonLdProps> = ({
  name,
  url,
  logo,
  description,
  sameAs,
}) => {
  const json: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
  }

  if (description) {
    json.description = description
  }

  if (sameAs) {
    json.sameAs = sameAs
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  )
}

// ---------- WebSite ------------------------------------------------
interface WebSiteJsonLdProps {
  name: string
  url: string
  description?: string
  inLanguage?: string | string[]
}

export const WebSiteJsonLd: FC<WebSiteJsonLdProps> = ({
  name,
  url,
  description,
  inLanguage,
}) => {
  const json: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
  }

  if (description) {
    json.description = description
  }

  if (inLanguage) {
    json.inLanguage = inLanguage
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  )
}

// ---------- BreadcrumbList -----------------------------------------
interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[]
}

export const BreadcrumbJsonLd: FC<BreadcrumbJsonLdProps> = ({ items }) => {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  )
}

// ---------- Aggregated wrapper -------------------------------------
interface StructuredDataWrapperProps {
  faq?: FAQItem[]
  software?: {
    name: string
    url: string
    description: string
    offers: { price: string; priceCurrency: string }
    aggregateRating?: { ratingValue: string; ratingCount: string }
    inLanguage?: string
  }
  organization?: {
    name: string
    url: string
    logo: string
    description?: string
    sameAs?: string[]
  }
  website?: {
    name: string
    url: string
    description?: string
    inLanguage?: string | string[]
  }
  breadcrumb?: BreadcrumbItem[]
}

export const StructuredData: FC<StructuredDataWrapperProps> = ({
  faq,
  software,
  organization,
  website,
  breadcrumb,
}) => (
  <>
    {faq && <FAQPageJsonLd questions={faq} />}
    {software && <SoftwareApplicationJsonLd {...software} />}
    {organization && <OrganizationJsonLd {...organization} />}
    {website && <WebSiteJsonLd {...website} />}
    {breadcrumb && <BreadcrumbJsonLd items={breadcrumb} />}
  </>
)