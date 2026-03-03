"use server";

export type NotionPage = {
  id: string;
  title: string;
  properties: Record<string, unknown>;
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

  const idMatch = databaseId.match(/([a-f0-9]{32}|[a-f0-9-]{36})/);
  if (databaseId.includes("notion.so") && idMatch) {
    console.log("Detected URL in NOTION_DATABASE_ID, extracting ID...");
    databaseId = idMatch[1];
  } else if (idMatch) {
    if (databaseId.length > 36) {
      databaseId = idMatch[0];
    }
  }

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
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Notion API Error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();

    const formattedData: NotionPage[] = data.results.map((page: Record<string, unknown>) => {
      let title = "Untitled";
      const props = page.properties as Record<string, unknown>;
      const titleProp = Object.values(props).find(
        (p: unknown) => (p as { id?: string })?.id === "title"
      ) as { title?: Array<{ plain_text: string }> } | undefined;
      if (titleProp && titleProp.title && titleProp.title.length > 0) {
        title = titleProp.title.map((t) => t.plain_text).join("");
      }

      let cover = null;
      const coverData = page.cover as any;
      if (coverData?.type === "external") cover = coverData.external?.url;
      if (coverData?.type === "file") cover = coverData.file?.url;

      let icon = null;
      const iconData = page.icon as any;
      if (iconData?.type === "emoji") icon = iconData.emoji;
      if (iconData?.type === "external") icon = iconData.external?.url;
      if (iconData?.type === "file") icon = iconData.file?.url;

      return {
        id: page.id as string,
        title,
        properties: page.properties as Record<string, unknown>,
        url: page.url as string,
        cover,
        icon,
      };
    });

    return { success: true, data: formattedData };
  } catch (error) {
    console.error("Notion API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch data from Notion";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
