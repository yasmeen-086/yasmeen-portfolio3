export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.VITE_GEMINI_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured - check env vars" });

  const { messages, system } = req.body;

  try {
    // Build contents - filter out any invalid messages
    const contents = [];
    for (const m of messages) {
      if (m.content && m.content.trim()) {
        contents.push({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        });
      }
    }

    // Gemini requires alternating user/model turns - ensure starts with user
    const filteredContents = [];
    for (let i = 0; i < contents.length; i++) {
      if (i === 0 && contents[i].role === "model") continue;
      filteredContents.push(contents[i]);
    }

    const body = {
      contents: filteredContents,
      generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
    };

    // Add system instruction if provided
    if (system) {
      body.system_instruction = { parts: [{ text: system }] };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", JSON.stringify(data));
      return res.status(500).json({ 
        error: data?.error?.message || "Gemini API error",
        details: data?.error 
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error("Empty response:", JSON.stringify(data));
      return res.status(500).json({ error: "Empty response from Gemini" });
    }

    return res.status(200).json({ reply: text });
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: err.message });
  }
}
