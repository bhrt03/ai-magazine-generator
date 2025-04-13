// pages/api/generate.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    // Import dynamic dependencies
    import { fetch } from 'undici';


    // Use your API keys here
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;

    if (!OPENAI_API_KEY || !UNSPLASH_API_KEY) {
      return res.status(500).json({ error: 'Missing API keys in environment variables' });
    }

    // 🔹 1. Generate article from OpenAI
    const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a magazine writer. Generate a well-structured, engaging, visually descriptive article suitable for a magazine format.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        temperature: 0.8,
        max_tokens: 1200,
      }),
    });

    const gptData = await gptRes.json();

    if (!gptData.choices || gptData.choices.length === 0) {
      throw new Error('Invalid GPT response');
    }

    const article = gptData.choices[0].message.content;

    // 🔹 2. Get 3 Unsplash images
    const unsplashRes = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3`, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_API_KEY}`,
      },
    });

    const unsplashData = await unsplashRes.json();

    const images = unsplashData.results.map(img => img.urls.regular);

    return res.status(200).json({
      article,
      images,
    });
  } catch (err) {
    console.error('🔥 Error in /api/generate:', err);
    return res.status(500).json({ error: 'Failed to generate magazine' });
  }
}
