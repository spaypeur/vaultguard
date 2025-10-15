import { useEffect } from 'react';
import { SEOProps, generateMetaTags, pageSEOConfig } from '../utils/seo';

interface SEOHeadProps {
  page?: keyof typeof pageSEOConfig;
  customSEO?: SEOProps;
  children?: React.ReactNode;
}

export default function SEOHead({ page, customSEO, children }: SEOHeadProps) {
  // Merge page SEO config with custom SEO props
  const seoProps: SEOProps = {
    ...pageSEOConfig[page || 'home'],
    ...customSEO
  };

  useEffect(() => {
    // Generate meta tags and structured data
    const { metaTags, links, structuredData } = generateMetaTags(seoProps);

    // Remove existing meta tags to avoid duplicates
    const existingMetaTags = document.querySelectorAll('meta[data-seo-managed]');
    existingMetaTags.forEach(tag => tag.remove());

    const existingLinks = document.querySelectorAll('link[data-seo-managed]');
    existingLinks.forEach(link => link.remove());

    const existingStructuredData = document.querySelectorAll('script[data-seo-structured-data]');
    existingStructuredData.forEach(script => script.remove());

    // Add new meta tags
    metaTags.forEach(({ name, property, content }) => {
      if (name || property) {
        const meta = document.createElement('meta');
        if (name) meta.name = name;
        if (property) meta.setAttribute('property', property);
        meta.content = content;
        meta.setAttribute('data-seo-managed', 'true');
        document.head.appendChild(meta);
      }
    });

    // Add new links
    links.forEach(({ rel, href }) => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      link.setAttribute('data-seo-managed', 'true');
      document.head.appendChild(link);
    });

    // Add structured data if provided
    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      script.setAttribute('data-seo-structured-data', 'true');
      document.head.appendChild(script);
    }

    // Update document title
    if (seoProps.title) {
      document.title = seoProps.title;
    }

    // Cleanup function to remove SEO tags when component unmounts
    return () => {
      const metaTagsToRemove = document.querySelectorAll('meta[data-seo-managed]');
      metaTagsToRemove.forEach(tag => tag.remove());

      const linksToRemove = document.querySelectorAll('link[data-seo-managed]');
      linksToRemove.forEach(link => link.remove());

      const structuredDataToRemove = document.querySelectorAll('script[data-seo-structured-data]');
      structuredDataToRemove.forEach(script => script.remove());
    };
  }, [seoProps]);

  return <>{children}</>;
}

// Convenience hook for using SEO in components
export function useSEO(page?: keyof typeof pageSEOConfig, customSEO?: SEOProps) {
  return {
    SEOHead: ({ children }: { children?: React.ReactNode }) => (
      <SEOHead page={page} customSEO={customSEO}>
        {children}
      </SEOHead>
    )
  };
}