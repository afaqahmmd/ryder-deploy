// Shopify API Configuration and Helpers
export const SHOPIFY_CONFIG = {
  // Default API version
  API_VERSION: '2023-10'
}

// Helper functions for building Shopify API URLs
export const buildStorefrontURL = (shopDomain, apiVersion = '2023-10') => {
  return `https://${shopDomain}.myshopify.com/api/${apiVersion}/graphql.json`
}

// Common GraphQL queries
export const SHOPIFY_QUERIES = {
  SHOP_INFO: `
    query getShop {
      shop {
        name
        description
        primaryDomain {
          url
        }
        paymentSettings {
          currencyCode
        }
      }
    }
  `,
  
  PRODUCTS: `
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            description
            handle
            images(first: 1) {
              edges {
                node {
                  url
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `,

  DETAILED_PRODUCTS: `
    query getProductsForKnowledgeBase($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            description
            handle
            productType
            vendor
            tags
            images(first: 5) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
            seo {
              title
              description
            }
          }
        }
      }
    }
  `
}   