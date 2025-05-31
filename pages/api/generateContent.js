// pages/api/generateContent.js
import { GoogleGenerativeAI } from '@google/generative-ai'; // <-- ADD THIS IMPORT

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
    // --- Initialize the Google Generative AI client ---
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Use the correct model name as per SDK usage (often just 'gemini-pro')
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // <-- Use 'gemini-pro' here directly

    // --- Generate content using the SDK ---
    const result = await model.generateContent(query);
    const response = await result.response;
    const generatedText = response.text(); // SDK provides a .text() method

    console.log("Gemini API Full Response Data (via SDK):", JSON.stringify(response.candidates, null, 2));

    if (!generatedText) {
      console.error("Gemini API did not return expected content or returned empty response:", response);
      return res.status(500).json({ error: "Empty or malformed content response from Gemini API." });
    }

    res.status(200).json({ text: generatedText });

  } catch (e) {
    // The SDK might throw more detailed errors.
    console.error("Content generation error (via SDK):", e);
    // Check for specific SDK error messages if needed, e.g., for API key issues
    if (e.message && e.message.includes('API key not valid')) {
        return res.status(500).json({ error: "Gemini API key invalid or unauthorized. Check Vercel environment variables." });
    } else if (e.message && e.message.includes('rate limit')) {
        return res.status(429).json({ error: "Gemini API rate limit exceeded. Please try again shortly." });
    }
    res.status(500).json({ error: "Failed to generate content due to a server error." });
  }
}
