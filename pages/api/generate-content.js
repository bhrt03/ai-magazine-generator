// pages/api/generateContent.js
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a magazine writer. Write an editorial-style article based on the user prompt. Make it engaging and structured like a real magazine article, with a headline, subheadings, and conclusion.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });

    const article = response.data.choices[0].message.content;
    res.status(200).json({ article });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
