export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return res.status(503).json({ error: "Server is missing OPENROUTER_API_KEY." });
  try {
    const message = String(req.body?.message || "").trim();
    if (!message) return res.status(400).json({ error: "Message is required." });
    if (message.length > 12000) return res.status(413).json({ error: "Message is too long (12,000 character limit)." });
    const model = String(req.body?.model || "");
    if (!model) return res.status(400).json({ error: "No model selected." });
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL || "https://sniper-vvv.pages.dev",
        "X-Title": "Sniper-$VVV"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: String(req.body?.system || "You are Sniper-$VVV, a helpful AI assistant.").slice(0, 3000) },
          { role: "user", content: message }
        ],
        temperature: 0.7
      })
    });
    const data = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json({ error: data.error?.message || "AI provider request failed." });
    return res.status(200).json({ reply: data.choices?.[0]?.message?.content || "", model: data.model || model });
  } catch {
    return res.status(502).json({ error: "Invalid request or upstream service unavailable." });
  }
}