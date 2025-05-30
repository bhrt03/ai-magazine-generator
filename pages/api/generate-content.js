// pages/api/generateContent.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + API_KEY,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Write a well-structured, magazine-style article on: ${topic}` }] }]
      })
    }
  );

  const data = await response.json();

  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Content generation failed.';
  res.status(200).json({ content });
}
