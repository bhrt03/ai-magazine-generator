export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { query } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  try {
    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: query }] }],
        }),
      }
    );

    const data = await geminiRes.json();
    console.log("Gemini API Response:", JSON.stringify(data)); // 👈 log full response

    const generated = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!generated) throw new Error("Empty response");

    res.status(200).json({ text: generated });
  } catch (e) {
    console.error("Content generation error:", e);
    res.status(500).json({ error: "Failed to generate content." });
  }
}
