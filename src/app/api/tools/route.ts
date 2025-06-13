import { type NextRequest } from "next/server";
import { db } from "@/server/db";
import { type ApiKeyOnProject } from "@prisma/client";

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey) {
    return new Response("Unauthorized: Missing API Key", { status: 401 });
  }

  try {
    const foundApiKey = await db.apiKey.findUnique({
      where: { key: apiKey },
      include: {
        projects: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!foundApiKey) {
      return new Response("Unauthorized: Invalid API Key", { status: 401 });
    }

    // Update last_used timestamp
    await db.apiKey.update({
      where: { id: foundApiKey.id },
      data: { last_used: new Date() },
    });

    const projectIds = foundApiKey.projects.map(
      (p: ApiKeyOnProject) => p.project_id,
    );

    if (projectIds.length === 0) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tools = await db.tool.findMany({
      where: {
        project_id: {
          in: projectIds,
        },
        is_active: true,
      },
    });

    return new Response(JSON.stringify(tools), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching tools with API key:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
