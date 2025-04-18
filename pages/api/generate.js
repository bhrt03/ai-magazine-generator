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
    if (!openaiResponse.ok) {
      return res.status(500).json({ error: 'OpenAI API failed', details: openaiText });
    }

    const openaiResult = JSON.parse(openaiText);
    const content = openaiResult.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'OpenAI response did not contain content.' });
    }

    // 2. Get images from Pexels
    const pexelsResponse = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(topic)}&per_page=3`, {
      headers: {
        Authorization: process.env.PEXELS_API_KEY,
      },
    });

    const pexelsText = await pexelsResponse.text();
    let images = [];

    if (pexelsResponse.ok) {
      const pexelsData = JSON.parse(pexelsText);
      images = pexelsData.photos?.map(photo => photo.src?.large).filter(Boolean);
    }

    // Fallback if no images
    if (!images || images.length === 0) {
      images = [
        'https://via.placeholder.com/800x600?text=Sample+Image+1',
        'https://via.placeholder.com/800x600?text=Sample+Image+2',
        'https://via.placeholder.com/800x600?text=Sample+Image+3'
      ];
    }

    return res.status(200).json({ content, images });

  } catch (err) {
    console.error('❌ Server error:', err);
    return res.status(500).json({ error: 'Server error occurred while generating content.' });
  }
}
