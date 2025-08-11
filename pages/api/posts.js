import { Client } from "@notionhq/client";

export default async function handler(req, res) {
  const notion = new Client({ auth: process.env.NOTION_TOKEN });

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const query = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: { property: "Published", checkbox: { equals: true } },
      sorts: [{ property: "Order", direction: "ascending" }]
    });

    const posts = query.results
      .map((page) => {
        const props = page.properties;
        let image = "";
        const imgProp = props["Image"];
        if (imgProp?.type === "url") image = imgProp.url || "";
        if (imgProp?.type === "files" && imgProp.files?.length) {
          const f = imgProp.files[0];
          image = f.type === "external" ? f.external.url : f.file.url;
        }
        const link = props["Link"]?.url || "";
        return { image, link };
      })
      .filter((p) => p.image);

    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
    res.status(200).json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to query Notion", details: err?.message });
  }
}
