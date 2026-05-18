"""Extracts a USD price from a fetched retailer page (markdown).

Source-aware: each retailer has a strategy keyed to a signal that actually
identifies *this product's* price. A miss returns None and the caller falls
back to verified RRP — the scraper never guesses. Mirrors parsePrice.ts.
"""

from __future__ import annotations

import re

# Captures the amount and whether it had explicit cents. Real shelf prices
# almost always show cents ($34.99); bare-integer "$25" amounts are usually
# category-filter links or marketing copy ("$25 off"), so they're untrusted.
_PRICE_RE = re.compile(r"\$\s?([0-9]+)(\.[0-9]{2})?")
# Amazon embeds an authoritative current price in a buybox JSON blob.
_AMAZON_BUYBOX_RE = re.compile(r'"priceAmount"\s*:\s*([0-9]+(?:\.[0-9]+)?)')


# A kid-product price floor/ceiling — rejects $0 / shipping-cost / absurd
# values without depending on a possibly-rough RRP estimate.
_ABS_MIN = 3.0
_ABS_MAX = 700.0


def _plausible(price: float, rrp: float | None) -> bool:
    """Trusted only within a sane band. With a known RRP, that's 0.55-1.2x
    RRP; without one, just the absolute kid-product floor/ceiling."""
    if not (_ABS_MIN <= price <= _ABS_MAX):
        return False
    if rrp is None:
        return True
    return rrp * 0.55 <= price <= rrp * 1.2


def _parse_amazon(text: str, rrp: float | None) -> float | None:
    """Amazon embeds an authoritative buybox price — but a page can serve a
    different variant's buybox. Reject obviously-bogus values always, and
    RRP-implausible ones when a real RRP is known."""
    m = _AMAZON_BUYBOX_RE.search(text)
    if not m:
        return None
    price = round(float(m.group(1)), 2)
    if not (_ABS_MIN <= price <= _ABS_MAX):
        return None
    if rrp is not None and not _plausible(price, rrp):
        return None
    return price


def _most_frequent_price(text: str, rrp: float | None) -> float | None:
    """Pick the real price from a noisy page.

    Strategy: among plausible amounts, strongly prefer those written with
    explicit cents ($34.99) over bare integers ($25) — bare integers are
    nav-filter links and marketing copy. Within a confidence tier, take the
    most frequent; ties break to the higher price (a struck-through original
    is rarer than the live price, but the live price is what repeats most).
    """
    cents: dict[float, int] = {}
    bare: dict[float, int] = {}
    for m in _PRICE_RE.finditer(text):
        has_cents = m.group(2) is not None
        price = round(float(m.group(1) + (m.group(2) or "")), 2)
        if not _plausible(price, rrp):
            continue
        bucket = cents if has_cents else bare
        bucket[price] = bucket.get(price, 0) + 1

    chosen = cents or bare  # cents-bearing prices win outright when present
    if not chosen:
        return None
    return max(chosen.items(), key=lambda kv: (kv[1], kv[0]))[0]


def parse_price(
    text: str | None, store_id: str, rrp: float | None
) -> float | None:
    if not text:
        return None
    if store_id == "amazon":
        # Amazon's buybox JSON is authoritative; fall back to frequency if
        # the blob isn't present on the page variant served.
        return _parse_amazon(text, rrp) or _most_frequent_price(text, rrp)
    return _most_frequent_price(text, rrp)
