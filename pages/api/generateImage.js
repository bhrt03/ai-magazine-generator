export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { prompt } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    res.status(500).json({ error: 'Missing Gemini API key' });
    return;
  }

  if (!prompt) {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `Generate an image based on: ${prompt}` }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!data.candidates || !data.candidates[0].content.parts[0].text) {
      res.status(500).json({ error: 'No image generated' });
      return;
    }

    const imageUrl = data.candidates[0].content.parts[0].text;
    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Image generation failed' });
  }
}
