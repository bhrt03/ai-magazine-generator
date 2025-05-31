// pages/api/generateContent.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // --- FIX: Expect 'query' from frontend's req.body ---
  const { query } = req.body;

  if (!query || query.trim() === '') { // Also check for empty string after trim
    console.error("Backend: Query is empty/null/undefined, returning 400.");
    return res.status(400).json({ error: 'Query for content is required.' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    console.error("GEMINI_API_KEY is not set!");
    return res.status(500).json({ error: 'Server configuration error: Gemini API Key missing.' });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: query }] }], // Use 'query' here
        }),
      }
    );

    if (!geminiRes.ok) {
      const errorData = await geminiRes.json().catch(() => ({ message: geminiRes.statusText || 'Unknown API Error' }));
      console.error(`Gemini API Error (${geminiRes.status} ${geminiRes.statusText}):`, errorData);

      // More specific error messages for the client
      if (geminiRes.status === 400 && errorData.error && errorData.error.message.includes("not found")) {
        return res.status(500).json({ error: "Gemini model ('gemini-pro') not found or invalid. Check model name and API version." });
      } else if (geminiRes.status === 401 || geminiRes.status === 403) {
        return res.status(500).json({ error: "Gemini API key invalid or unauthorized. Check Vercel environment variables." });
      } else if (geminiRes.status === 429) {
        return res.status(429).json({ error: "Gemini API rate limit exceeded. Please try again shortly." });
      } else {
        return res.status(500).json({ error: `Failed to generate content from Gemini API: ${errorData.error?.message || errorData.message}` });
      }
    }

    const data = await geminiRes.json();
    console.log("Gemini API Full Response Data:", JSON.stringify(data, null, 2));

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error("Gemini API did not return expected content or returned empty response:", data);
      if (data.error) {
        return res.status(500).json({ error: `Gemini API returned an internal error: ${data.error.message}` });
      }
      return res.status(500).json({ error: "Empty or malformed content response from Gemini API." });
    }

    // --- FIX: Send 'text' property, as frontend expects 'contentData.text' ---
    res.status(200).json({ text: generatedText });
  } catch (e) {
    console.error("Content generation error:", e);
    res.status(500).json({ error: "Failed to generate content due to a server error." });
  }
}
