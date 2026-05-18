"""Product discovery from Amazon search/category pages.

Crawl4AI returns an Amazon results page as markdown. Each result appears as a
heading link:  ## [Product Name](https://www.amazon.com/.../dp/ASIN...)
This module extracts those (name, asin, url) candidates. It does NOT verify
or filter — see generate_catalog.py for that.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

# A markdown heading whose text is a link to an Amazon /dp/ product page.
_HEADING_LINK_RE = re.compile(
    r"^#+\s*\[([^\]]{8,200})\]\((https://www\.amazon\.com[^)]*?/dp/([A-Z0-9]{10})[^)]*)\)",
    re.MULTILINE,
)


@dataclass
class Candidate:
    name: str
    asin: str
    url: str  # canonical /dp/ url


def _canonical_url(asin: str) -> str:
    return f"https://www.amazon.com/dp/{asin}"


def discover_from_markdown(markdown: str) -> list[Candidate]:
    """Extract product candidates from one Amazon results page's markdown.

    Deduplicates by ASIN, keeping the first (longest-titled) occurrence.
    """
    seen: dict[str, Candidate] = {}
    for m in _HEADING_LINK_RE.finditer(markdown):
        name = m.group(1).strip()
        asin = m.group(3)
        if asin in seen:
            # keep the longer, more descriptive title if we see it twice
            if len(name) <= len(seen[asin].name):
                continue
        seen[asin] = Candidate(name=name, asin=asin, url=_canonical_url(asin))
    return list(seen.values())
