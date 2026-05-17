"""Reusable Crawl4AI helper.

A thin wrapper around Crawl4AI's AsyncWebCrawler for fetching pages as clean
markdown, using a local stealth browser that gets past most retail bot
detection. Import `fetch_pages` from other scripts.

Run with the project's crawler venv:
    ~/.crawl4ai-venv/bin/python <script>.py
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass

from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
from crawl4ai.async_configs import CacheMode


@dataclass
class PageResult:
    url: str
    ok: bool
    markdown: str
    error: str | None = None


# Concurrency is modest on purpose: a handful of real browser tabs is plenty
# and keeps us looking like a person, not a scraper farm.
_MAX_CONCURRENCY = 4


async def _fetch_one(
    crawler: AsyncWebCrawler,
    url: str,
    run_config: CrawlerRunConfig,
    sem: asyncio.Semaphore,
) -> PageResult:
    async with sem:
        try:
            result = await crawler.arun(url=url, config=run_config)
        except Exception as exc:  # noqa: BLE001 - report, don't crash the batch
            return PageResult(url=url, ok=False, markdown="", error=str(exc))
    if not result.success:
        return PageResult(
            url=url,
            ok=False,
            markdown="",
            error=result.error_message or "fetch failed",
        )
    return PageResult(url=url, ok=True, markdown=str(result.markdown or ""))


async def fetch_pages(urls: list[str]) -> dict[str, PageResult]:
    """Fetch many URLs concurrently. Returns a map keyed by the requested URL.

    A failed page is present in the map with ok=False — callers decide how to
    fall back rather than the helper silently dropping it.
    """
    browser_config = BrowserConfig(headless=True)
    run_config = CrawlerRunConfig(cache_mode=CacheMode.BYPASS)
    sem = asyncio.Semaphore(_MAX_CONCURRENCY)

    async with AsyncWebCrawler(config=browser_config) as crawler:
        results = await asyncio.gather(
            *(_fetch_one(crawler, url, run_config, sem) for url in urls)
        )
    return {r.url: r for r in results}
