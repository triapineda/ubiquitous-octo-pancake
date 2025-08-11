export default async function handler(req, res) {
  try {
    const { src } = req.query;
    if (!src || typeof src !== "string") {
      res.status(400).send("Missing src");
      return;
    }
    const url = new URL(src);
    if (url.protocol !== "https:") {
      res.status(400).send("Only https URLs are allowed");
      return;
    }

    // Follow redirects; some Notion/S3 URLs redirect
    const upstream = await fetch(src, {
      redirect: "follow",
      headers: { "accept": "image/*" }
    });

    if (!upstream.ok) {
      res.status(upstream.status).send(`Upstream fetch failed (${upstream.status})`);
      return;
    }

    // Pass through content-type, cache a bit
    const ct = upstream.headers.get("content-type") || "application/octet-stream";
    res.setHeader("Content-Type", ct);
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=1800, stale-while-revalidate=86400");
    // Allow embedding anywhere (Notion iframe, etc.)
    res.setHeader("Access-Control-Allow-Origin", "*");

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.status(200).send(buf);
  } catch (e) {
    console.error("Proxy error:", e);
    res.status(500).send("Proxy error");
  }
}
