import React from 'react';
import LiveProductCatalogContent from './LiveProductCatalogContent';

/**
 * Product Catalog - Main entry point
 * Now always uses the live catalog implementation
 */
export default function ProductCatalog() {
  return <LiveProductCatalogContent />;
}
