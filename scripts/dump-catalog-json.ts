// Dumps the fetch plan and seed offers as JSON on stdout so the Python
// price scraper (crawl_prices.py) can consume them without duplicating the
// TypeScript source. Run via:
//   node --experimental-strip-types scripts/dump-catalog-json.ts

import { SEED_OFFERS } from '../lib/catalog/offers.seed.ts';
import { FETCH_PLAN } from './fetchPlan.ts';

process.stdout.write(
  JSON.stringify({ fetchPlan: FETCH_PLAN, seedOffers: SEED_OFFERS })
);
