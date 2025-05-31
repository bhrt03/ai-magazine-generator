// pages/api/generateImage.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt || prompt.trim() === '') {
    return res.status(400).json({ error: 'Prompt for image is required.' });
  }

  const API_KEY = process.env.STABILITY_API_KEY;

  if (!API_KEY) {
    console.error("STABILITY_API_KEY is not set!");
    return res.status(500).json({ error: 'Server configuration error: Stability AI API Key missing.' });
  }

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

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText || 'Unknown API Error' }));
        console.error(`Stability AI API Error (${response.status} ${response.statusText}):`, errorData);

        if (response.status === 401 || response.status === 403) {
            return res.status(500).json({ error: "Stability AI API key invalid or unauthorized. Check Vercel environment variables." });
        } else if (response.status === 429) {
            return res.status(429).json({ error: "Stability AI API rate limit exceeded. Please try again shortly." });
        } else {
            return res.status(500).json({ error: `Failed to generate image from Stability AI: ${errorData.message || 'Unknown API Error'}` });
        }
    }

    const data = await response.json();
    console.log("Stability AI API Full Response Data:", JSON.stringify(data, null, 2));

    if (data.artifacts && data.artifacts[0]?.base64) {
      const imageBase64 = data.artifacts[0].base64;
      // --- FIX: Send 'imageUrl' property, as frontend expects 'imageData.imageUrl' ---
      return res.status(200).json({ imageUrl: `data:image/png;base64,${imageBase64}` });
    } else {
      console.error("Stability AI response missing artifacts or malformed:", data);
      return res.status(500).json({ error: 'Image generation failed: Unexpected API response format.' });
    }

  } catch (error) {
    console.error('Error during image generation request:', error);
    return res.status(500).json({ error: 'Something went wrong with the image generation service.' });
  }
}
