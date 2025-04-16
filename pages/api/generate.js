// pages/api/generate.js

import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
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
          { role: 'system', content: 'You are a professional magazine writer creating beautiful long-form content with sections and headers.' },
          { role: 'user', content: `Write a rich, multi-paragraph magazine article about: ${topic}. Include facts, subheadings, and compelling narrative.` }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("OpenAI returned incomplete response:", data);
      return res.status(500).json({ error: 'Failed to generate article' });
    }

    const article = data.choices[0].message.content.trim();

    res.status(200).json({ article });

  } catch (error) {
    console.error('Error calling OpenAI:', error);
    res.status(500).json({ error: 'Failed to generate article' });
  }
}
