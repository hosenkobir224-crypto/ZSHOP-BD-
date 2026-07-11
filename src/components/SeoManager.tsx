import { useEffect } from "react";
import { Product } from "../types";

interface SeoManagerProps {
  selectedProduct: Product | null;
  selectedShopName: string | null;
  selectedCategory: string;
  searchQuery: string;
  categoryName?: string;
}

export default function SeoManager({
  selectedProduct,
  selectedShopName,
  selectedCategory,
  searchQuery,
  categoryName
}: SeoManagerProps) {
  useEffect(() => {
    const origin = window.location.origin;

    // Default Fallback Metadata
    let title = "ZSHOP BD | Online Shopping in Bangladesh";
    let description = "ZSHOP BD (জেডশপ বিডি) is the leading premium online shopping store in Bangladesh. Order authentic electronics, gadgets, clothing, and household lifestyle items with cash on delivery and fast shipping.";
    let canonical = origin + "/";
    let ogImage = "https://images.unsplash.com/photo-1472851294608-062f824d296e?q=80&w=600&auto=format&fit=crop";
    let ogType = "website";
    let schemas: any[] = [];

    // Base Organization Schema (Always present)
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${origin}/#organization`,
      "name": "ZSHOP BD",
      "alternativeName": "জেডশপ বিডি",
      "url": origin + "/",
      "logo": "https://images.unsplash.com/photo-1472851294608-062f824d296e?q=80&w=600&auto=format&fit=crop",
      "description": "Premium e-commerce store in Bangladesh offering elite delivery, genuine products, and daily flash sales.",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+880-1700-000000",
        "contactType": "customer service",
        "areaServed": "BD",
        "availableLanguage": ["Bengali", "English"]
      }
    };
    schemas.push(orgSchema);

    // 1. ACTIVE PRODUCT VIEW (Highest Priority)
    if (selectedProduct) {
      title = `${selectedProduct.title} | Buy Online in Bangladesh - ZSHOP BD`;
      description = selectedProduct.description 
        ? `${selectedProduct.description.substring(0, 150).trim()}... Buy authentic on ZSHOP BD with fast Cash on Delivery in Bangladesh.`
        : `${selectedProduct.title} - Sourced premium seller authentic product in Bangladesh. Order online.`;
      canonical = `${origin}/?product=${selectedProduct.id}`;
      ogImage = selectedProduct.image;
      ogType = "product";

      // Product Schema
      const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${origin}/?product=${selectedProduct.id}#product`,
        "name": selectedProduct.title,
        "image": selectedProduct.image,
        "description": selectedProduct.description || `${selectedProduct.title} from ZSHOP BD`,
        "brand": {
          "@type": "Brand",
          "name": selectedProduct.merchantShopName || "ZSHOP BD"
        },
        "offers": {
          "@type": "Offer",
          "url": `${origin}/?product=${selectedProduct.id}`,
          "priceCurrency": "BDT",
          "price": selectedProduct.price,
          "itemCondition": "https://schema.org/NewCondition",
          "availability": selectedProduct.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "priceValidUntil": "2027-12-31"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": selectedProduct.rating || 4.8,
          "reviewCount": selectedProduct.reviewsCount || 12
        }
      };
      schemas.push(productSchema);

      // Breadcrumb Schema
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": origin + "/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": selectedProduct.category,
            "item": `${origin}/?category=${encodeURIComponent(selectedProduct.category)}`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": selectedProduct.title,
            "item": `${origin}/?product=${selectedProduct.id}`
          }
        ]
      };
      schemas.push(breadcrumbSchema);

    // 2. ACTIVE SHOP VIEW
    } else if (selectedShopName) {
      title = `${selectedShopName} Online Store | Verified Merchant - ZSHOP BD`;
      description = `Explore original products, premium garments, lifestyle electronics and custom items from ${selectedShopName} at ZSHOP BD. Direct shipment and nationwide cash on delivery.`;
      canonical = `${origin}/?shop=${encodeURIComponent(selectedShopName)}`;
      ogType = "profile";

      const storeSchema = {
        "@context": "https://schema.org",
        "@type": "Store",
        "@id": `${origin}/?shop=${encodeURIComponent(selectedShopName)}#store`,
        "name": selectedShopName,
        "url": `${origin}/?shop=${encodeURIComponent(selectedShopName)}`,
        "parentOrganization": {
          "@id": `${origin}/#organization`
        }
      };
      schemas.push(storeSchema);

      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": origin + "/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Shops",
            "item": origin + "/#shops"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": selectedShopName,
            "item": `${origin}/?shop=${encodeURIComponent(selectedShopName)}`
          }
        ]
      };
      schemas.push(breadcrumbSchema);

    // 3. SEARCH RESULTS ACTIVE
    } else if (searchQuery) {
      title = `Search results for "${searchQuery}" | ZSHOP BD`;
      description = `Find the cheapest authentic deals, gadgets and accessories for "${searchQuery}" on ZSHOP BD. High trust customer reviews, secured ordering and fast delivery.`;
      canonical = `${origin}/?search=${encodeURIComponent(searchQuery)}`;

    // 4. CATEGORY FILTER ACTIVE
    } else if (selectedCategory && selectedCategory !== "all") {
      const catLabel = categoryName || selectedCategory;
      title = `${catLabel} Collection | Premium Shopping BD - ZSHOP BD`;
      description = `Discover handpicked authentic brand items in ${catLabel} department on ZSHOP BD. Premium authentic items with free call confirmations and easy refunds.`;
      canonical = `${origin}/?category=${encodeURIComponent(selectedCategory)}`;

      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": origin + "/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": catLabel,
            "item": `${origin}/?category=${encodeURIComponent(selectedCategory)}`
          }
        ]
      };
      schemas.push(breadcrumbSchema);

    // 5. STANDARD HOMEPAGE
    } else {
      // organization and website schemas
      const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        "url": origin + "/",
        "name": "ZSHOP BD",
        "description": "ZSHOP BD | Online Retail Shopping Store in Bangladesh",
        "publisher": {
          "@id": `${origin}/#organization`
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${origin}/?search={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      };
      schemas.push(websiteSchema);
    }

    // === DOM Updates ===
    document.title = title;

    // Update / Create Meta Tags Helper
    const setMeta = (nameAttr: string, value: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attr}="${nameAttr}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, nameAttr);
        document.head.appendChild(element);
      }
      element.setAttribute("content", value);
    };

    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:image", ogImage, true);
    setMeta("og:url", canonical, true);
    setMeta("og:type", ogType, true);

    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ogImage);

    // Canonical link update
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonical);

    // Schema injection update
    let schemaScript = document.getElementById("zshop-ld-json-schema");
    if (!schemaScript) {
      schemaScript = document.createElement("script");
      schemaScript.setAttribute("id", "zshop-ld-json-schema");
      schemaScript.setAttribute("type", "application/ld+json");
      document.head.appendChild(schemaScript);
    }

    schemaScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": schemas
    });

  }, [selectedProduct, selectedShopName, selectedCategory, searchQuery, categoryName]);

  return null;
}
