async function scrapeLinkedIn(linkedinUrl, apiToken) {
  const endpoint =
    "https://api.apify.com/v2/acts/harvestapi~linkedin-profile-scraper" +
    "/run-sync-get-dataset-items?token=" + apiToken + "&timeout=90";

  const input = {
    startUrls: [{ url: linkedinUrl }],
  };

  console.log("[Apify] Scraping:", linkedinUrl);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[Apify] Error:", res.status, body);
    throw new Error(`Apify returned ${res.status}: ${body}`);
  }

  const items = await res.json();
  console.log("[Apify] Items count:", items && items.length);
  if (items && items.length) {
    console.log("[Apify] Fields returned:", Object.keys(items[0]).join(", "));
  }

  if (!items || !items.length) return null;

  // Pass the raw profile data as JSON string — Claude will extract what it needs
  const p = items[0];
  return JSON.stringify(p, null, 2);
}

module.exports = { scrapeLinkedIn };
