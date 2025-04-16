// pages/api/generate.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Missing topic in request body' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional magazine writer creating beautiful long-form content with sections and headers.'
          },
          {
            role: 'user',
            content: `Write a rich, multi-paragraph magazine article about: "${topic}". Include facts, subheadings, and compelling narrative.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    // Debug logs
    const text = await response.text();
    console.log('🧾 OpenAI raw response:', text);

    // Attempt to parse
    const result = JSON.parse(text);

    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'No content returned from OpenAI' });
    }

    return res.status(200).json({ content });

  } catch (err) {
    console.error('❌ Error generating article:', err);
    return res.status(500).json({ error: 'Failed to generate article' });
  }
}
