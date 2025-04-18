import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { topic } = req.body;
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a magazine writer. Create engaging content." },
        { role: "user", content: `Write a 200-word magazine article about ${topic}` }
      ],
    });

    res.status(200).json({ content: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "AI generation failed" });
  }
}
