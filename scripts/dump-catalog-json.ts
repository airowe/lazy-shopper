// Dumps the product catalog as JSON on stdout so the Python price scraper
// (crawl_prices.py) can consume the single TypeScript source of truth
// without duplicating it. Run via:
//   node --experimental-strip-types scripts/dump-catalog-json.ts

import { PRODUCTS } from '../lib/catalog/products.ts';

process.stdout.write(JSON.stringify({ products: PRODUCTS }));
