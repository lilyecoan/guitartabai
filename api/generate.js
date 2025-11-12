// api/generate.js
import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await client.messages.create({
      // 👇 Use the latest Claude model
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      messages: [
        { role: "user", content: `Generate guitar tabs for: ${prompt}` },
      ],
    });

    const text = response.content?.[0]?.text || "No response";
    res.status(200).json({ result: text });
  } catch (err) {
    console.error("Error generating tabs:", err);
    res.status(500).json({ error: err.message });
  }
}
