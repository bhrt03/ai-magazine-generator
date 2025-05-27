export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a professional magazine content writer. Write content in an engaging, informative, and magazine-style tone. Format it with sections, subheadings, and flow like a print magazine article.",
          },
          {
            role: "user",
            content: `Write a magazine-style article on: ${prompt}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({ error: "Invalid response from OpenAI" });
    }

    const article = data.choices[0].message.content;
    res.status(200).json({ article });
  } catch (error) {
    res.status(500).json({ error: "Error generating content" });
  }
}
