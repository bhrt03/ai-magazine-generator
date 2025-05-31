export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { prompt } = req.body;
  const API_KEY = process.env.STABILITY_API_KEY;

  try {
    const response = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 512,
        width: 512,
        steps: 30,
      }),
    });

    const data = await response.json();
    const base64 = data.artifacts?.[0]?.base64;
    if (!base64) throw new Error("Image not generated");

    res.status(200).json({ imageUrl: `data:image/png;base64,${base64}` });
  } catch (e) {
    res.status(500).json({ error: "Image generation failed" });
  }
}
