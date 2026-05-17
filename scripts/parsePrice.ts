// Extracts a USD price from fetched retailer page text (markdown).
//
// Pages vary wildly, so this is deliberately conservative: it finds dollar
// amounts, drops implausible ones, and returns the most likely sale price.
// A miss returns null — the caller falls back to the known RRP rather than
// inventing a number.

const PRICE_RE = /\$\s?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/g;

function toNumber(raw: string): number {
  return Number(raw.replace(/,/g, ''));
}

// Plausible price range for a kid's toy/game. Anything outside is noise
// (shipping thresholds, unrelated products, gift-card amounts, etc.).
const MIN_PRICE = 3;
const MAX_PRICE = 700;

export type ParseOptions = {
  // Known manufacturer RRP. Prices wildly above it are rejected as noise;
  // a price near or below it is trusted.
  rrp: number;
};

export function parsePrice(
  text: string | null,
  opts: ParseOptions
): number | null {
  if (!text) return null;

  const candidates: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = PRICE_RE.exec(text)) !== null) {
    const value = toNumber(m[1]);
    if (value < MIN_PRICE || value > MAX_PRICE) continue;
    // A retailer rarely sells above RRP; allow a small markup for noise
    // tolerance but reject anything more than 1.5x RRP.
    if (value > opts.rrp * 1.5) continue;
    candidates.push(value);
  }

  if (candidates.length === 0) return null;

  // The lowest plausible candidate is almost always the active sale price
  // (struck-through originals read higher; the live price reads lowest or
  // equal). Clamp to two decimals.
  const price = Math.min(...candidates);
  return Math.round(price * 100) / 100;
}
