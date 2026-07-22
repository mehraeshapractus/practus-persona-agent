async function scrapeLinkedIn(linkedinUrl, apiToken) {
  const endpoint =
    "https://api.apify.com/v2/acts/curious_coder~linkedin-profile-scraper" +
    "/run-sync-get-dataset-items?token=" + apiToken + "&timeout=90";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profileUrls: [linkedinUrl] }),
  });

  if (!res.ok) {
    throw new Error(`Apify returned ${res.status}: ${await res.text()}`);
  }

  const items = await res.json();
  if (!items || !items.length) return null;

  const p = items[0];

  const lines = [];

  if (p.fullName || p.firstName)
    lines.push(`Name: ${p.fullName || [p.firstName, p.lastName].filter(Boolean).join(" ")}`);
  if (p.headline)      lines.push(`Headline: ${p.headline}`);
  if (p.location)      lines.push(`Location: ${p.location}`);
  if (p.summary)       lines.push(`\nAbout:\n${p.summary}`);

  if (p.positions && p.positions.length) {
    lines.push("\nExperience:");
    for (const pos of p.positions) {
      const dateStr = [
        pos.startDate ? formatDate(pos.startDate) : null,
        pos.endDate   ? formatDate(pos.endDate)   : (pos.isCurrent ? "Present" : null),
      ].filter(Boolean).join(" – ");
      lines.push(`  • ${pos.title || ""} @ ${pos.companyName || ""}${dateStr ? " (" + dateStr + ")" : ""}`);
      if (pos.description) lines.push(`    ${pos.description.slice(0, 300)}`);
    }
  }

  if (p.educations && p.educations.length) {
    lines.push("\nEducation:");
    for (const ed of p.educations) {
      lines.push(`  • ${ed.schoolName || ""}${ed.fieldOfStudy ? " — " + ed.fieldOfStudy : ""}${ed.degree ? " (" + ed.degree + ")" : ""}`);
    }
  }

  if (p.skills && p.skills.length) {
    lines.push("\nSkills: " + p.skills.slice(0, 20).map((s) => s.name || s).join(", "));
  }

  if (p.certifications && p.certifications.length) {
    lines.push("\nCertifications:");
    for (const c of p.certifications) {
      lines.push(`  • ${c.name || ""}${c.authority ? " (" + c.authority + ")" : ""}`);
    }
  }

  if (p.posts && p.posts.length) {
    lines.push("\nRecent LinkedIn posts:");
    for (const post of p.posts.slice(0, 5)) {
      const text = (post.text || post.commentary || "").slice(0, 400);
      if (text) lines.push(`  — "${text}"`);
    }
  }

  return lines.join("\n");
}

function formatDate(d) {
  if (!d) return "";
  if (typeof d === "string") return d;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  if (d.month) return `${months[d.month - 1]} ${d.year}`;
  return String(d.year || "");
}

module.exports = { scrapeLinkedIn };
