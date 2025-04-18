export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Missing topic in request body' });
  }

  try {
    // 1. Generate article from OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional magazine writer creating beautiful long-form content with sections and headers.',
          },
          {
            role: 'user',
            content: `Write a rich, multi-paragraph magazine article about: "${topic}". Include facts, subheadings, and compelling narrative.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const openaiText = await openaiResponse.text();
    console.log('🧾 OpenAI raw response:', openaiText);

    if (!openaiResponse.ok) {
      return res.status(500).json({
        error: 'OpenAI API failed',
        details: openaiText,
      });
    }

    const openaiResult = JSON.parse(openaiText);
    const content = openaiResult.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'OpenAI response did not contain content.' });
    }

    // 2. Fetch 3 related images from Unsplash
    const unsplashResponse = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(topic)}&per_page=3&client_id=${process.env.UNSPLASH_ACCESS_KEY}`
    );

    const unsplashText = await unsplashResponse.text();
    console.log('🖼️ Unsplash raw response:', unsplashText);

    if (!unsplashResponse.ok) {
      return res.status(500).json({
        error: 'Unsplash API failed',
        details: unsplashText,
      });
    }

    const unsplashData = JSON.parse(unsplashText);
    const images = unsplashData.results?.map(img => img.urls?.regular).filter(Boolean);

    if (!images || images.length === 0) {
      return res.status(500).json({ error: 'No images found from Unsplash.' });
    }

    // ✅ Final response
    return res.status(200).json({ content, images });

  } catch (err) {
    console.error('🔥 Server Error:', err);
    return res.status(500).json({ error: 'Server error occurred while generating content.' });
  }
}
