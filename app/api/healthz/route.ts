import { redis } from "@/lib/redis";

export async function GET() {
  try {
    await redis.ping();
    return Response.json({ ok: true });
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 500 });
  }
}
