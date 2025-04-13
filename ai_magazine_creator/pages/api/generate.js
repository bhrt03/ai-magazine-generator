export default async function handler(req, res) {
  const { query } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: `Write a long, detailed magazine-style article about ${query}` }],
    }),
  });

  const aiData = await openaiRes.json();
  const article = aiData.choices[0].message.content;

  let image = "";
  try {
    const unsplashRes = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=${unsplashKey}`);
    const imgData = await unsplashRes.json();
    image = imgData.urls?.regular || "";
  } catch (e) {
    image = "";
  }

  res.status(200).json({ article, image });
}