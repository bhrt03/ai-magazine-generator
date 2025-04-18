import OpenAI from 'openai';

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

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a creative magazine writer." },
        { role: "user", content: `Write a 250-word magazine article about ${topic}` }
      ],
    });

    res.status(200).json({ 
      content: response.choices[0]?.message?.content || "No content generated"
    });

  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ 
      error: error.message || "AI generation failed",
      details: error 
    });
  }
}
