"use server";

export type NotionPage = {
  id: string;
  title: string;
  properties: Record<string, any>;
  url: string;
  cover: string | null;
  icon: string | null;
};

export async function getNotionData(): Promise<{
  success: boolean;
  data?: NotionPage[];
  error?: string;
}> {
  let databaseId = process.env.NOTION_DATABASE_ID;
  const apiKey = process.env.NOTION_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "Notion API Key is missing. Please set NOTION_KEY in .env.local",
    };
  }

  if (!databaseId) {
    return {
      success: false,
      error:
        "Notion Database ID is missing. Please set NOTION_DATABASE_ID in .env.local",
    };
  }

  // Extract ID if it's a URL
  // Matches 32 hex chars, potentially with hyphens
  const idMatch = databaseId.match(/([a-f0-9]{32}|[a-f0-9-]{36})/);
  if (databaseId.includes("notion.so") && idMatch) {
    console.log("Detected URL in NOTION_DATABASE_ID, extracting ID...");
    databaseId = idMatch[1];
  } else if (idMatch) {
    // It might be just the ID, or a string containing the ID
    // If it's just the ID (clean), use it. If it looks like a dirty string, try to extract.
    if (databaseId.length > 36) {
      databaseId = idMatch[0];
    }
  }

  // Force UUID format (add hyphens if missing)
  const toUUID = (id: string) => {
    if (id.length === 36) return id;
    if (id.length === 32) {
      return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(
        12,
        16
      )}-${id.slice(16, 20)}-${id.slice(20)}`;
    }
    return id;
  };

  databaseId = toUUID(databaseId);

  console.log(`Using Database ID: ${databaseId}`);

  // Direct fetch to bypass SDK issues
  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${databaseId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ page_size: 100 }),
        next: { revalidate: 60 }, // Cache for 60 seconds
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Notion API Error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();

    const formattedData: NotionPage[] = data.results.map((page: any) => {
      // Extract title (This is a bit heuristic as property names vary)
      let title = "Untitled";
      const titleProp = Object.values(page.properties).find(
        (p: any) => p.id === "title"
      ) as any;
      if (titleProp && titleProp.title && titleProp.title.length > 0) {
        title = titleProp.title.map((t: any) => t.plain_text).join("");
      }

      // Cover and Icon
      let cover = null;
      if (page.cover?.type === "external") cover = page.cover.external.url;
      if (page.cover?.type === "file") cover = page.cover.file.url;

      let icon = null;
      if (page.icon?.type === "emoji") icon = page.icon.emoji;
      if (page.icon?.type === "external") icon = page.icon.external.url;
      if (page.icon?.type === "file") icon = page.icon.file.url;

      return {
        id: page.id,
        title,
        properties: page.properties,
        url: page.url,
        cover,
        icon,
      };
    });

    return { success: true, data: formattedData };
  } catch (error: any) {
    console.error("Notion API Error:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch data from Notion",
    };
  }
}
