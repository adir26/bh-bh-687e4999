/**
 * Public routes that can be accessed without authentication (in guest mode)
 */
const PUBLIC_ROUTES = [
  '/',
  '/home',
  '/search',
  '/categories',
  '/inspiration',
  '/inspiration/photo',
  '/articles',
  '/suppliers',
  '/supplier',
  '/s/', // Public supplier profiles
  '/category',
  '/top-suppliers',
  '/new-suppliers',
  '/hot-now',
  '/local-deals',
  '/popular-now',
  '/support',
  '/faq',
  '/privacy-policy',
  '/accessibility',
  '/terms',
  '/welcome',
  '/app-exclusive'
];

/**
 * Check if a route is publicly accessible (can be accessed in guest mode)
 */
export const isPublicRoute = (pathname: string): boolean => {
  // Handle exact matches
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }
  
  // Handle dynamic routes with patterns
  const dynamicPatterns = [
    /^\/supplier\/[^/]+$/,                    // /supplier/:id
    /^\/supplier\/[^/]+\/products$/,         // /supplier/:id/products
    /^\/supplier\/[^/]+\/reviews$/,          // /supplier/:id/reviews
    /^\/s\/[^/]+$/,                          // /s/:slug (public supplier profiles)
    /^\/s\/[^/]+\/p\/[^/]+$/,               // /s/:slug/p/:productId
    /^\/category\/[^/]+\/suppliers$/,        // /category/:category/suppliers
    /^\/inspiration\/photo\/[^/]+$/,         // /inspiration/photo/:id
    /^\/quote\/share\/[^/]+$/,               // /quote/share/:token public quote view
    /^\/public\/inspection\/[^/]+$/,         // /public/inspection/:id public inspection reports
    /^\/boards\/[^/]+$/,                     // /boards/:token public mood boards
    /^\/proposal\/signature\/[^/]+$/,        // /proposal/signature/:token public proposal signatures
  ];
  
  return dynamicPatterns.some(pattern => pattern.test(pathname));
};