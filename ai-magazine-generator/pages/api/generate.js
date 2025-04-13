import axios from "axios";

export default async function handler(req, res) {
  const { topic } = req.body;

  const openai = process.env.OPENAI_API_KEY;
  const unsplash = process.env.UNSPLASH_ACCESS_KEY;

  try {
    const gpt = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Write a long, detailed article in magazine style about: ${topic}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${openai}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = gpt.data.choices[0].message.content;

    const unsplashRes = await axios.get(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        topic
      )}&per_page=5&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${unsplash}`,
        },
      }
    );

    const imageUrls = unsplashRes.data.results.slice(0, 5).map((img) => img.urls.regular);

    res.status(200).json({ title: `Magazine: ${topic}`, content: text, images: imageUrls });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate magazine" });
  }
}