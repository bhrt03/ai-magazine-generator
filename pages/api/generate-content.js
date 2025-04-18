import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional magazine writer. Create a detailed 3-paragraph article with engaging content."
        },
        {
          role: "user",
          content: `Write a magazine article about: ${topic}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    res.status(200).json({
      content: completion.choices[0]?.message?.content || "No content was generated"
    });

  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({
      error: 'Failed to generate content',
      details: error.message
    });
  }
}
