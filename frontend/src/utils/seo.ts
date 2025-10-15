// SEO utility functions for VaultGuard
export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  noindex?: boolean;
  structuredData?: object;
}

export interface PageSEOConfig {
  [key: string]: SEOProps;
}

// Default SEO configuration for each page
export const pageSEOConfig: PageSEOConfig = {
  home: {
    title: 'VaultGuard - Elite Crypto Security & Recovery by Real Expert',
    description: '20+ years hacking expertise. Government clearances. Dark web monitoring. Recover stolen crypto with 94.7% success rate. Protect assets with elite security for ultra-high-net-worth individuals.',
    keywords: [
      'crypto security', 'cryptocurrency protection', 'crypto recovery', 'blockchain security',
      'dark web monitoring', 'crypto hacking expert', 'stolen crypto recovery', 'crypto wallet security',
      'DeFi protection', 'crypto compliance', 'crypto tax reporting', 'blockchain forensics'
    ],
    ogTitle: 'VaultGuard - Elite Crypto Security & Recovery',
    ogDescription: 'Professional crypto security service with 20+ years hacking expertise. Dark web monitoring, stolen crypto recovery, and elite asset protection.',
    ogImage: '/vaultguard-og-image.jpg',
    ogType: 'website'
  },
  services: {
    title: 'Elite Crypto Security Services - VaultGuard',
    description: 'Comprehensive crypto protection services including dark web monitoring, expert recovery operations, compliance automation, and tax reporting for high-net-worth individuals.',
    keywords: [
      'crypto security services', 'dark web monitoring', 'crypto recovery services', 'blockchain compliance',
      'crypto tax services', 'cryptocurrency protection', 'DeFi security', 'wallet security'
    ],
    ogTitle: 'Professional Crypto Security Services - VaultGuard',
    ogDescription: 'Elite crypto protection services with dark web monitoring, expert recovery, and compliance automation.',
    ogType: 'website'
  },
  about: {
    title: 'About VaultGuard - Real Expert with 20+ Years Hacking Experience',
    description: 'Meet the real expert behind VaultGuard. 20+ years hacking experience, government security clearances, and proven track record recovering millions in stolen crypto.',
    keywords: [
      'crypto security expert', 'hacking expertise', 'crypto recovery specialist', 'blockchain security consultant',
      'cybersecurity professional', 'crypto forensics expert', 'dark web specialist'
    ],
    ogTitle: 'Real Crypto Security Expert - VaultGuard',
    ogDescription: 'Meet the expert with 20+ years hacking experience and government clearances protecting elite crypto assets.',
    ogType: 'website'
  },
  pricing: {
    title: 'Crypto Security Pricing - VaultGuard Elite Protection Plans',
    description: 'Transparent pricing for elite crypto security services. Dark web monitoring from $50K/year, expert recovery case-by-case, compliance included.',
    keywords: [
      'crypto security pricing', 'cryptocurrency protection cost', 'crypto recovery rates',
      'blockchain security pricing', 'crypto compliance pricing', 'enterprise crypto security'
    ],
    ogTitle: 'Elite Crypto Security Pricing - VaultGuard',
    ogDescription: 'Transparent pricing for professional crypto security services with proven results.',
    ogType: 'website'
  },
  'case-studies': {
    title: 'Crypto Recovery Case Studies - VaultGuard Success Stories',
    description: 'Real crypto recovery case studies with verified results. $2.4B+ assets recovered, 94.7% success rate across 200+ cases. See proven track record.',
    keywords: [
      'crypto recovery cases', 'stolen crypto recovery', 'blockchain forensics cases',
      'crypto hacking recovery', 'DeFi exploit recovery', 'crypto scam recovery'
    ],
    ogTitle: 'Proven Crypto Recovery Results - VaultGuard',
    ogDescription: 'Real case studies showing successful crypto recovery operations with verified blockchain analysis.',
    ogType: 'website'
  },
  blog: {
    title: 'Crypto Security Intelligence & Dark Web Monitoring - VaultGuard',
    description: 'Latest crypto security intelligence, dark web threat reports, blockchain security insights, and expert analysis for protecting digital assets.',
    keywords: [
      'crypto security blog', 'blockchain security news', 'crypto threats', 'dark web monitoring',
      'DeFi security updates', 'crypto hacking news', 'blockchain forensics insights'
    ],
    ogTitle: 'Crypto Security Intelligence Blog - VaultGuard',
    ogDescription: 'Expert insights on crypto security, dark web threats, and blockchain protection strategies.',
    ogType: 'website'
  },
  login: {
    title: 'Login to VaultGuard - Elite Crypto Security Dashboard',
    description: 'Access your VaultGuard dashboard for real-time crypto security monitoring, threat intelligence, and asset protection.',
    keywords: [
      'crypto security login', 'blockchain security dashboard', 'crypto protection login',
      'DeFi security access', 'crypto wallet monitoring'
    ],
    ogTitle: 'Access Elite Crypto Security Dashboard - VaultGuard',
    ogDescription: 'Login to your professional crypto security dashboard for real-time protection and monitoring.',
    ogType: 'website'
  },
  register: {
    title: 'Join VaultGuard - Elite Crypto Security for High-Net-Worth Individuals',
    description: 'Register for elite crypto security services. 30-day free trial, no credit card required. Protect your digital assets with expert security.',
    keywords: [
      'crypto security registration', 'join crypto protection', 'crypto security trial',
      'blockchain security signup', 'DeFi protection registration'
    ],
    ogTitle: 'Start Elite Crypto Security Protection - VaultGuard',
    ogDescription: 'Join VaultGuard for professional crypto security with 30-day free trial. No credit card required.',
    ogType: 'website'
  },
  'tax-reports': {
    title: 'Crypto Tax Reporting Service - Automated IRS Form 8949 - VaultGuard',
    description: 'Automated crypto tax reporting with IRS Form 8949 generation. Exchange integration, cost basis tracking, and comprehensive tax documentation.',
    keywords: [
      'crypto tax reporting', 'cryptocurrency taxes', 'IRS Form 8949', 'crypto tax software',
      'blockchain tax reporting', 'DeFi tax reporting', 'crypto cost basis'
    ],
    ogTitle: 'Automated Crypto Tax Reporting - VaultGuard',
    ogDescription: 'Professional crypto tax reporting service with automated IRS Form 8949 generation and exchange integration.',
    ogType: 'website'
  },
  'recovery': {
    title: 'Expert Crypto Recovery Services - Recover Stolen Cryptocurrency - VaultGuard',
    description: 'Professional crypto recovery services for stolen funds. Expert tracking across blockchains, dark web monitoring, and recovery operations.',
    keywords: [
      'crypto recovery services', 'recover stolen crypto', 'cryptocurrency recovery', 'blockchain recovery',
      'stolen bitcoin recovery', 'crypto scam recovery', 'DeFi exploit recovery'
    ],
    ogTitle: 'Expert Crypto Recovery Services - VaultGuard',
    ogDescription: 'Professional recovery services for stolen cryptocurrency with proven track record and expert blockchain analysis.',
    ogType: 'website'
  },
  'security-audits': {
    title: 'Smart Contract Security Audits - Blockchain Security Analysis - VaultGuard',
    description: 'Comprehensive smart contract security audits and blockchain vulnerability assessments for DeFi protocols and crypto projects.',
    keywords: [
      'smart contract audit', 'blockchain security audit', 'DeFi security audit', 'crypto audit',
      'blockchain vulnerability assessment', 'smart contract security', 'DeFi protocol audit'
    ],
    ogTitle: 'Professional Smart Contract Security Audits - VaultGuard',
    ogDescription: 'Expert smart contract security audits and blockchain vulnerability assessments for crypto projects.',
    ogType: 'website'
  }
};

// Generate structured data for organization
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "VaultGuard",
  "description": "Elite crypto security and recovery services by a real expert with 20+ years hacking experience",
  "url": "https://vaultguard.io",
  "logo": "https://vaultguard.io/vaultguard-logo.png",
  "founder": {
    "@type": "Person",
    "name": "Expert Security Professional",
    "jobTitle": "Chief Security Officer",
    "expertise": "Cryptocurrency Security, Blockchain Forensics, Dark Web Intelligence"
  },
  "areaServed": "Global",
  "serviceType": [
    "Cryptocurrency Security",
    "Crypto Recovery Services",
    "Dark Web Monitoring",
    "Blockchain Forensics",
    "Smart Contract Audits",
    "Compliance Automation"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "150"
  }
});

// Generate structured data for services
export const generateServiceSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Elite Crypto Security Services",
  "description": "Professional cryptocurrency security and recovery services",
  "provider": {
    "@type": "Organization",
    "name": "VaultGuard"
  },
  "serviceType": "Cryptocurrency Security",
  "areaServed": "Global",
  "offers": [
    {
      "@type": "Offer",
      "name": "Dark Web Monitoring",
      "description": "24/7 monitoring of dark web channels for stolen crypto",
      "priceRange": "$50K+"
    },
    {
      "@type": "Offer",
      "name": "Expert Recovery Operations",
      "description": "Professional crypto recovery with blockchain forensics",
      "priceRange": "Case-by-case"
    }
  ]
});

// Generate structured data for case studies
export const generateCaseStudySchema = (caseData: {
  title: string;
  description: string;
  result: string;
  timeline: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "CaseStudy",
  "name": caseData.title,
  "description": caseData.description,
  "result": caseData.result,
  "timeline": caseData.timeline,
  "provider": {
    "@type": "Organization",
    "name": "VaultGuard"
  }
});

// Helper function to generate all meta tags
export const generateMetaTags = (seoProps: SEOProps) => {
  const {
    title,
    description,
    keywords = [],
    canonical,
    ogTitle,
    ogDescription,
    ogImage = '/vaultguard-og-image.jpg',
    ogType = 'website',
    twitterCard = 'summary_large_image',
    noindex = false,
    structuredData
  } = seoProps;

  const metaTags: Array<{ name?: string; property?: string; content: string }> = [];
  const links: Array<{ rel: string; href: string }> = [];

  // Basic meta tags
  if (title) {
    metaTags.push({ name: 'title', content: title });
  }

  if (description) {
    metaTags.push({ name: 'description', content: description });
  }

  if (keywords.length > 0) {
    metaTags.push({ name: 'keywords', content: keywords.join(', ') });
  }

  if (canonical) {
    links.push({ rel: 'canonical', href: canonical });
  }

  if (noindex) {
    metaTags.push({ name: 'robots', content: 'noindex, nofollow' });
  } else {
    metaTags.push({ name: 'robots', content: 'index, follow' });
  }

  // Open Graph tags
  if (ogTitle || title) {
    metaTags.push({ property: 'og:title', content: ogTitle || title || '' });
  }

  if (ogDescription || description) {
    metaTags.push({ property: 'og:description', content: ogDescription || description || '' });
  }

  metaTags.push({ property: 'og:type', content: ogType });
  metaTags.push({ property: 'og:url', content: window.location.href });
  metaTags.push({ property: 'og:image', content: ogImage });
  metaTags.push({ property: 'og:site_name', content: 'VaultGuard' });

  // Twitter Card tags
  metaTags.push({ name: 'twitter:card', content: twitterCard });
  if (ogTitle || title) {
    metaTags.push({ name: 'twitter:title', content: ogTitle || title || '' });
  }
  if (ogDescription || description) {
    metaTags.push({ name: 'twitter:description', content: ogDescription || description || '' });
  }
  metaTags.push({ name: 'twitter:image', content: ogImage });

  // Additional SEO tags
  metaTags.push({ name: 'author', content: 'VaultGuard' });
  metaTags.push({ name: 'viewport', content: 'width=device-width, initial-scale=1.0' });
  metaTags.push({ name: 'format-detection', content: 'telephone=no' });

  return { metaTags, links, structuredData };
};