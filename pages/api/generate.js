import { fetch } from 'undici';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;

    if (!OPENAI_API_KEY || !UNSPLASH_API_KEY) {
      return res.status(500).json({ error: 'Missing API keys' });
    }

    // 🔹 OpenAI call to generate magazine-style article
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
            content: 'You are a professional magazine writer. Write a detailed, engaging, visually descriptive article suitable for a digital magazine.',
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

    const article = gptData.choices?.[0]?.message?.content || 'No article generated.';

    // 🔹 Unsplash call to get 3 images
    const unsplashRes = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_API_KEY}`,
        },
      }
    );

    const unsplashData = await unsplashRes.json();

    const images = unsplashData.results?.map((img) => img.urls.regular) || [];

    return res.status(200).json({ article, images });

  } catch (err) {
    console.error('🔥 /api/generate error:', err);
    return res.status(500).json({ error: 'Failed to generate magazine' });
  }
}
