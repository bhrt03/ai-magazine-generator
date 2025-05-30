// pages/api/generate-content.js

import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { topic } = req.body;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  try {
    const result = await model.generateContent(`Write a magazine-style article about: ${topic}. Include a heading, subheadings, and a friendly informative tone.`);
    const text = await result.response.text();
    res.status(200).json({ content: text });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate content", details: error.toString() });
  }
}
