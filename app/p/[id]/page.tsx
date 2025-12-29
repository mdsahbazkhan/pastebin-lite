import { redis } from "@/lib/redis";
import { notFound } from "next/navigation";

function getNow(headers: Headers) {
  if (process.env.TEST_MODE === "1") {
    const testNow = headers.get("x-test-now-ms");
    if (testNow) return Number(testNow);
  }
  return Date.now();
}

export default async function PastePage({
  params,
  headers,
}: {
  params: Promise<{ id: string }>; 
  headers: Headers;
}) {
  const { id } = await params; 
  const key = `paste:${id}`;

  const paste = await redis.hgetall<any>(key);

  if (!paste || !paste.content) {
    notFound();
  }

  const now = getNow(headers);


  if (paste.expires_at && now >= Number(paste.expires_at)) {
    notFound();
  }

  if (paste.max_views && Number(paste.views) >= Number(paste.max_views)) {
    notFound();
  }

  await redis.hincrby(key, "views", 1);

  return (
    <main style={{ padding: "24px", fontFamily: "monospace" }}>
      <h1>Paste</h1>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          background: "#f5f5f5",
          padding: "16px",
          borderRadius: "6px",
        }}
      >
        {paste.content}
      </pre>
    </main>
  );
}
