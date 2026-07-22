async function scrapeLinkedIn(linkedinUrl, apiToken) {
  // Try anchor/linkedin-profile-enrichment (4.9 stars, 9.1K users)
  const endpoint =
    "https://api.apify.com/v2/acts/anchor~linkedin-profile-enrichment" +
    "/run-sync-get-dataset-items?token=" + apiToken + "&timeout=45";

  const input = { linkedinUrls: [linkedinUrl] };

  console.log("[Apify] Scraping:", linkedinUrl);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      console.error("[Apify] HTTP error:", res.status);
      return null;
    }

    const items = await res.json();
    console.log("[Apify] Items count:", items && items.length);
    if (items && items.length) {
      console.log("[Apify] Fields:", Object.keys(items[0]).join(", "));
      return JSON.stringify(items[0], null, 2);
    }
  } catch (e) {
    console.error("[Apify] Failed:", e.message);
  }

  return null;
}

module.exports = { scrapeLinkedIn };
