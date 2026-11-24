export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed", models: [] });
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return res.status(503).json({ error: "OPENROUTER_API_KEY is not configured", models: [] });
  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${key}` }
    });
    const body = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json({ error: body.error?.message || "OpenRouter model catalog request failed", models: [] });
    const blockedModel = /inclusion\\s*ai|inclusionai|ling[-\\s._]*3[.]?2[-\\s._]*flash/i;
    const models = (body.data || [])
      .filter(m => m.id?.endsWith(":free") || (Number(m.pricing?.prompt) === 0 && Number(m.pricing?.completion) === 0))
      .filter(m => !blockedModel.test(String(m.id || "") + " " + String(m.name || "")))
      .map(m => ({ id: m.id, name: m.name || m.id }))
      .slice(0, 100);
    return res.status(200).json({ models });
  } catch {
    return res.status(502).json({ error: "Unable to load model directory", models: [] });
  }
}