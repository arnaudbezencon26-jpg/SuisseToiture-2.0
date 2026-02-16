import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
}

export function useSEO({ title, description, canonical, noindex }: SEOProps) {
  useEffect(() => {
    const fullTitle = `${title} | SuisseToiture®`;
    document.title = fullTitle;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', title);

    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute('content', description);

    if (canonical) {
      const link = document.querySelector('link[rel="canonical"]');
      if (link) link.setAttribute('href', canonical);

      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', canonical);
    }

    const robots = document.querySelector('meta[name="robots"]');
    if (robots) {
      robots.setAttribute('content', noindex ? 'noindex, nofollow' : 'index, follow');
    }
  }, [title, description, canonical, noindex]);
}
