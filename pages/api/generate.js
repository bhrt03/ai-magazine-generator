import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Missing topic' });
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Write a long, magazine-style article on the topic: "${query}". Make it engaging and informative.`,
          },
        ],
        max_tokens: 1200,
      }),
    });

    const openaiData = await openaiRes.json();
    const article = openaiData.choices?.[0]?.message?.content || 'Failed to generate article.';

    const unsplashRes = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&client_id=${process.env.UNSPLASH_API_KEY}`
    );
    const unsplashData = await unsplashRes.json();
    const images = unsplashData.results?.map((img) => img.urls.regular) || [];

    res.status(200).json({ article, images });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Failed to generate magazine' });
  }
}
