// pages/api/generate-image.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const API_KEY = process.env.STABILITY_API_KEY;

  try {
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-v1-5/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 512,
        width: 512,
        samples: 1,
        steps: 30
      })
    });

    const data = await response.json();

    if (data.artifacts && data.artifacts[0]?.base64) {
      const imageBase64 = data.artifacts[0].base64;
      return res.status(200).json({ image: `data:image/png;base64,${imageBase64}` });
    } else {
      return res.status(500).json({ error: 'Image generation failed' });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
