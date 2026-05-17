// Extracts a USD price from a fetched retailer page (markdown).
//
// Retailer pages are noisy — "frequently bought together" carousels,
// shipping thresholds, financing offers all look like prices. So parsing is
// source-aware: each retailer has a strategy keyed to a signal that actually
// identifies *this product's* price. A miss returns null and the caller
// falls back to verified RRP — the script never guesses.

import type { StoreId } from '../lib/catalog/types.ts';

export type ParseOptions = {
  storeId: StoreId;
  rrp: number;
};

const round2 = (n: number): number => Math.round(n * 100) / 100;

// A scraped price is only trusted if it lands in a sane band around the
// known RRP. Retail discounts rarely exceed ~45%; prices above RRP are
// possible (scalping, bundles) but we cap at 1.2x to reject cross-sell noise.
function plausible(price: number, rrp: number): boolean {
  return price >= rrp * 0.55 && price <= rrp * 1.2;
}

// Amazon embeds a buybox JSON blob with the authoritative current price:
//   {"desktop_buybox_group_1":[{"displayPrice":"$19.97","priceAmount":19.97,...
function parseAmazon(text: string, rrp: number): number | null {
  const m = text.match(/"priceAmount"\s*:\s*([0-9]+(?:\.[0-9]+)?)/);
  if (!m) return null;
  const price = round2(Number(m[1]));
  return plausible(price, rrp) ? price : null;
}

// LEGO.com product pages are clean — the only dollar amounts on the page
// are the product price (usually repeated). Take the first plausible one.
function parseLego(text: string, rrp: number): number | null {
  const matches = [...text.matchAll(/\$\s?([0-9]+(?:\.[0-9]{2})?)/g)];
  for (const m of matches) {
    const price = round2(Number(m[1]));
    if (plausible(price, rrp)) return price;
  }
  return null;
}

// Generic fallback for other retailers' product pages: collect all dollar
// amounts, keep only those plausible against RRP, and take the most
// frequent one (a product page repeats the real price; noise is scattered).
function parseGeneric(text: string, rrp: number): number | null {
  const counts = new Map<number, number>();
  for (const m of text.matchAll(/\$\s?([0-9]+(?:\.[0-9]{2})?)/g)) {
    const price = round2(Number(m[1]));
    if (!plausible(price, rrp)) continue;
    counts.set(price, (counts.get(price) ?? 0) + 1);
  }
  if (counts.size === 0) return null;
  let best = 0;
  let bestCount = 0;
  for (const [price, count] of counts) {
    if (count > bestCount) {
      best = price;
      bestCount = count;
    }
  }
  return best || null;
}

export function parsePrice(
  text: string | null,
  opts: ParseOptions
): number | null {
  if (!text) return null;
  switch (opts.storeId) {
    case 'amazon':
      return parseAmazon(text, opts.rrp);
    case 'lego':
      return parseLego(text, opts.rrp);
    default:
      return parseGeneric(text, opts.rrp);
  }
}
