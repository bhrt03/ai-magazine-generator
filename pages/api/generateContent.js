// pages/api/generateContent.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.body;

  if (!query || query.trim() === '') {
    console.error("Backend: Query is empty/null/undefined, returning 400.");
    return res.status(400).json({ error: 'Query for content is required.' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    console.error("GEMINI_API_KEY is not set!");
    return res.status(500).json({ error: 'Server configuration error: Gemini API Key missing.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // --- CHANGE THIS LINE: Use 'gemini-1.0-pro' ---
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

    const result = await model.generateContent(query);
    const response = await result.response;
    const generatedText = response.text();

    console.log("Gemini API Full Response Data (via SDK):", JSON.stringify(response.candidates, null, 2));

    if (!generatedText) {
      console.error("Gemini API did not return expected content or returned empty response:", response);
      return res.status(500).json({ error: "Empty or malformed content response from Gemini API." });
    }

    res.status(200).json({ text: generatedText });

  } catch (e) {
    console.error("Content generation error (via SDK):", e);
    // Improved error messages
    let errorMessage = "Failed to generate content due to a server error.";
    if (e.message) {
      if (e.message.includes('API key not valid')) {
          errorMessage = "Gemini API key invalid or unauthorized. Check Vercel environment variables.";
      } else if (e.message.includes('rate limit')) {
          errorMessage = "Gemini API rate limit exceeded. Please try again shortly.";
      } else if (e.message.includes('not found') || e.message.includes('unsupported')) {
          errorMessage = "Gemini model ('gemini-1.0-pro') not found or unsupported for this API version/method. Please check Google AI Studio.";
      }
    }
    res.status(500).json({ error: errorMessage });
  }
}
