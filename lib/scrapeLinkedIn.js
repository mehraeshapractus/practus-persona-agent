async function scrapeLinkedIn(linkedinUrl, apiToken) {
  // Use crawlerbros — works without login, faster than harvestapi
  const endpoint =
    "https://api.apify.com/v2/acts/crawlerbros~linkedin-profile-scraper" +
    "/run-sync-get-dataset-items?token=" + apiToken + "&timeout=45";

  const input = { profileUrls: [linkedinUrl] };

  console.log("[Apify] Scraping:", linkedinUrl);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[Apify] Error:", res.status, body.slice(0, 200));
    throw new Error(`Apify ${res.status}`);
  }

  const items = await res.json();
  console.log("[Apify] Items count:", items && items.length);
  if (items && items.length) {
    console.log("[Apify] Fields:", Object.keys(items[0]).join(", "));
  }

  if (!items || !items.length) return null;

  // Return raw JSON — Claude extracts what it needs
  return JSON.stringify(items[0], null, 2);
}

module.exports = { scrapeLinkedIn };
