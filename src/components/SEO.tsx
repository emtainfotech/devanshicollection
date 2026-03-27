import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

const SEO = ({ 
  title, 
  description = "Devanshi Collection - Premium Ethnic and Modern Wear for Women. Shop the latest dresses, tops, and ethnic wear.", 
  keywords = "women fashion, ethnic wear, modern dresses, devanshi collection",
  image = "/logo-devanshi.svg",
  url = window.location.href
}: SEOProps) => {
  const siteTitle = "Devanshi Collection";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

  useEffect(() => {
    // Update title
    document.title = fullTitle;

    // Update description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Update keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);

    // Update OG tags
    const updateOgTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateOgTag('og:title', fullTitle);
    updateOgTag('og:description', description);
    updateOgTag('og:image', image);
    updateOgTag('og:url', url);
    updateOgTag('og:type', 'website');

    // Update Twitter tags
    const updateTwitterTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateTwitterTag('twitter:card', 'summary_large_image');
    updateTwitterTag('twitter:title', fullTitle);
    updateTwitterTag('twitter:description', description);
    updateTwitterTag('twitter:image', image);

  }, [fullTitle, description, keywords, image, url]);

  return null;
};

export default SEO;
