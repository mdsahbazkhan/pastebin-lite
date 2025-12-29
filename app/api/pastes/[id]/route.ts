import { redis } from "@/lib/redis";

function getNow(req: Request) {
  if (process.env.TEST_MODE === "1") {
    const testNow = req.headers.get("x-test-now-ms");
    if (testNow) return Number(testNow);
  }
  return Date.now();
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; 
  const key = `paste:${id}`;

  const paste = await redis.hgetall<any>(key);

  if (!paste || !paste.content) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
    });
  }

  const now = getNow(req);

  if (paste.expires_at && now >= Number(paste.expires_at)) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
    });
  }


  if (paste.max_views && Number(paste.views) >= Number(paste.max_views)) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
    });
  }


  const views = await redis.hincrby(key, "views", 1);

  const remaining_views =
    paste.max_views != null
      ? Math.max(Number(paste.max_views) - views, 0)
      : null;

  return Response.json({
    content: paste.content,
    remaining_views,
    expires_at: paste.expires_at
      ? new Date(Number(paste.expires_at)).toISOString()
      : null,
  });
}
