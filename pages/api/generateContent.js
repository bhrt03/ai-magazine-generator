// pages/api/generateContent.js

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { topic } = req.body; // Assuming you changed Home.js to send 'topic'

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    console.error("GEMINI_API_KEY is not set!");
    return res.status(500).json({ error: 'Server configuration error: Gemini API Key missing' });
  }

  try {
    const geminiRes = await fetch(
      // --- FIX IS HERE ---
      // Ensure the model path is exactly 'gemini-pro' without any accidental characters
      // or ensure it matches what the official docs for direct API calls recommend for v1beta.
      // The current path looks correct for the model name, so let's ensure no hidden chars.
      // If problems persist, consider 'gemini-pro-vision' or 'gemini-1.0-pro' for specific cases
      // but 'gemini-pro' should be the direct text model.
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: topic }] }], // Use 'topic' as per frontend
        }),
      }
    );

    // --- IMPROVED ERROR HANDLING ---
    if (!geminiRes.ok) {
        const errorData = await geminiRes.json().catch(() => ({})); // Try to parse error response
        console.error(`Gemini API Error (${geminiRes.status} ${geminiRes.statusText}):`, errorData);

        // Check for specific common errors like 400, 401, 429
        if (geminiRes.status === 400 && errorData.error && errorData.error.message.includes("not found")) {
            return res.status(500).json({ error: "Gemini model not found or invalid. Check model name and API version." });
        } else if (geminiRes.status === 401 || geminiRes.status === 403) {
            return res.status(500).json({ error: "Gemini API key invalid or unauthorized. Check Vercel environment variables." });
        } else if (geminiRes.status === 429) {
            return res.status(429).json({ error: "Gemini API rate limit exceeded. Please try again shortly." });
        } else {
            return res.status(500).json({ error: "Failed to generate content from Gemini API." });
        }
    }
    // --- END IMPROVED ERROR HANDLING ---

    const data = await geminiRes.json();
    console.log("Gemini API Full Response Data:", JSON.stringify(data, null, 2)); // Prettier log

    // Check if candidates array exists and has content
    const generated = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generated) {
        console.error("Gemini API did not return expected content or returned empty response:", data);
        // If data indicates an error *within* a 200 OK response (rare but possible), handle it
        if (data.error) {
            return res.status(500).json({ error: `Gemini API returned an internal error: ${data.error.message}` });
        }
        throw new Error("Empty or malformed content response from Gemini API.");
    }

    res.status(200).json({ content: generated }); // Ensure frontend expects 'content', not 'text'
  } catch (e) {
    console.error("Content generation error:", e);
    // Be careful not to expose too much internal error detail to the client
    res.status(500).json({ error: "Failed to generate content due to a server error." });
  }
}
