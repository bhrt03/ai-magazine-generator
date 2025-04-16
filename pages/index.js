import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Missing topic' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a magazine writer who crafts engaging, informative, long-form articles.'
          },
          {
            role: 'user',
            content: `Write a detailed magazine-style article about: ${topic}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    const data = await response.json();

    // 🔍 Log the full OpenAI response
    console.log('🧠 OpenAI response:', JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices[0]?.message?.content) {
      return res.status(500).json({ error: 'Failed to generate article' });
    }

    const article = data.choices[0].message.content;
    res.status(200).json({ article });

  } catch (error) {
    console.error('🔥 OpenAI API error:', error);
    res.status(500).json({ error: 'Server error while generating article' });
  }
}
