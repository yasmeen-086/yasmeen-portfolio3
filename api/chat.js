export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.VITE_GEMINI_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  const { messages, system } = req.body;

  try {
    const contents = [];
    for (const m of messages) {
      if (m.content && m.content.trim()) {
        contents.push({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        });
      }
    }

    while (contents.length > 0 && contents[0].role === "model") {
      contents.shift();
    }

    const body = {
      contents,
      generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
    };

    if (system) {
      body.system_instruction = { parts: [{ text: system }] };
    }

    // Try gemini-pro which is universally available
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", JSON.stringify(data));
      return res.status(500).json({ error: data?.error?.message || "Gemini error" });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return res.status(500).json({ error: "Empty response" });

    return res.status(200).json({ reply: text });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
