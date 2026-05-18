"""Filter discovered product candidates down to real, kid-appropriate items.

Category pages are noisy: accessories, adult-display sets, unrelated items,
and listings that just happen to mention the search term. This applies
keyword heuristics. It is deliberately conservative — when unsure it keeps
the item but marks it low-confidence, so a human can do a final pass rather
than the filter silently dropping real products.
"""

from __future__ import annotations

from dataclasses import dataclass

from discover import Candidate

# Words that signal the listing is NOT a kid product we want: accessories,
# add-ons, display kits, and adult-targeted content.
_REJECT = (
    "light kit",
    "led light",
    "lighting kit",
    "display case",
    "display stand",
    "acrylic case",
    "storage",
    "replacement",
    "compatible with lego",  # 3rd-party add-ons
    "screen protector",
    "phone case",
    "costume",
    "backpack",
    "lunch box",
    "bedding",
    "wallpaper",
    "sticker",
)

# An adult-display set is real but not for a 10-year-old.
_ADULT = ("18+", "adults welcome", "build and display set for adults")


@dataclass
class FilteredCandidate:
    candidate: Candidate
    category: str
    confidence: str  # "high" | "low"
    note: str


def _matches(name_lc: str, words: tuple[str, ...]) -> str | None:
    for w in words:
        if w in name_lc:
            return w
    return None


def filter_candidates(
    candidates: list[Candidate],
    *,
    category: str,
    require_terms: tuple[str, ...],
) -> tuple[list[FilteredCandidate], list[tuple[Candidate, str]]]:
    """Returns (kept, rejected).

    require_terms: at least one must appear in the name (e.g. ("minecraft",))
    so a "minecraft toys" search doesn't keep an unrelated cross-sell.
    """
    kept: list[FilteredCandidate] = []
    rejected: list[tuple[Candidate, str]] = []

    for c in candidates:
        name_lc = c.name.lower()

        if not any(t in name_lc for t in require_terms):
            rejected.append((c, f"missing required term {require_terms}"))
            continue

        bad = _matches(name_lc, _REJECT)
        if bad:
            rejected.append((c, f"reject keyword: {bad}"))
            continue

        adult = _matches(name_lc, _ADULT)
        confidence = "low" if adult else "high"
        note = f"adult-targeted ({adult})" if adult else ""
        kept.append(
            FilteredCandidate(
                candidate=c,
                category=category,
                confidence=confidence,
                note=note,
            )
        )

    return kept, rejected
