// Minimal TinyFish Fetch API client.
// Fetch renders URLs in a real browser and returns clean page content,
// getting past the bot detection that blocks plain server-side fetches.
// Docs: https://docs.tinyfish.ai/  — POST https://api.fetch.tinyfish.ai/

const FETCH_ENDPOINT = 'https://api.fetch.tinyfish.ai/';
const BATCH_SIZE = 10; // TinyFish Fetch accepts up to 10 URLs per call

export type FetchResult = {
  url: string;
  finalUrl: string | null;
  title: string | null;
  text: string | null;
};

type RawResult = {
  url: string;
  final_url: string | null;
  title: string | null;
  text: string | object | null;
};

type RawResponse = {
  results: RawResult[];
  errors: { url: string; error: string }[];
};

function apiKey(): string {
  const key = process.env.TINYFISH_API_KEY;
  if (!key) {
    throw new Error(
      'TINYFISH_API_KEY is not set. Get a free key at agent.tinyfish.ai ' +
        'and run: TINYFISH_API_KEY=... node --experimental-strip-types ' +
        'scripts/refresh-prices.ts'
    );
  }
  return key;
}

async function fetchBatch(urls: string[]): Promise<FetchResult[]> {
  const res = await fetch(FETCH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey(),
    },
    body: JSON.stringify({ urls, format: 'markdown' }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`TinyFish Fetch ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as RawResponse;
  for (const err of data.errors ?? []) {
    console.warn(`  ! fetch failed for ${err.url}: ${err.error}`);
  }

  return (data.results ?? []).map((r) => ({
    url: r.url,
    finalUrl: r.final_url,
    title: r.title,
    text: typeof r.text === 'string' ? r.text : null,
  }));
}

// Fetch many URLs, batched to the API limit. Returns a map keyed by the
// requested URL. URLs that error out are simply absent from the map.
export async function fetchAll(
  urls: string[]
): Promise<Map<string, FetchResult>> {
  const out = new Map<string, FetchResult>();
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    console.log(
      `  fetching ${i + 1}-${i + batch.length} of ${urls.length}...`
    );
    const results = await fetchBatch(batch);
    for (const r of results) out.set(r.url, r);
  }
  return out;
}
