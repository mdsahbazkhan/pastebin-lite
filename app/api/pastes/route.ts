import { nanoid } from "nanoid";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const body = JSON.parse(text);

    const { content, ttl_seconds, max_views } = body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return new Response(
        JSON.stringify({
          error: "content is required and must be a non-empty string",
        }),
        { status: 400 }
      );
    }

    if (ttl_seconds !== undefined) {
      if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
        return new Response(
          JSON.stringify({ error: "ttl_seconds must be an integer >= 1" }),
          { status: 400 }
        );
      }
    }

    if (max_views !== undefined) {
      if (!Number.isInteger(max_views) || max_views < 1) {
        return new Response(
          JSON.stringify({ error: "max_views must be an integer >= 1" }),
          { status: 400 }
        );
      }
    }

    const id = nanoid(8);
    const now = Date.now();

    const expires_at =
      ttl_seconds !== undefined ? now + ttl_seconds * 1000 : null;

    await redis.hset(`paste:${id}`, {
      content,
      created_at: now,
      expires_at,
      max_views: max_views ?? null,
      views: 0,
    });

    const requestUrl = new URL(req.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

    return Response.json({
      id,
      url: `${baseUrl}/p/${id}`,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
    });
  }
}
