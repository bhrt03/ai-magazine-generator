import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    // More specific prompt for magazine-style content
    const prompt = `Create a professional magazine article about ${topic} with:
    - An engaging headline
    - 3-4 paragraphs of well-structured content
    - Interesting facts or statistics
    - A concluding thought`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a professional magazine editor." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('No content generated');
    }

    res.status(200).json({ 
      content: response.choices[0].message.content 
    });

  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ 
      error: 'Content generation failed',
      details: error.message 
    });
  }
}
