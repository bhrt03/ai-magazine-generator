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
    const response = await fetch(
      // --- CHANGE THIS LINE: Use a current model ID ---
      // Common choices: 'stable-diffusion-xl-1024-v1-0' (for SDXL), 'stable-diffusion-v1-6' (for SD 1.x)
      // I recommend trying 'stable-diffusion-xl-1024-v1-0' for better quality.
      `https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height: 1024, // Change height/width to match SDXL recommendations
          width: 1024, // SDXL performs best at 1024x1024
          samples: 1,
          steps: 30
        })
      }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText || 'Unknown API Error' }));
        console.error(`Stability AI API Error (${response.status} ${response.statusText}):`, errorData);

        let errorMessage = "Failed to generate image from Stability AI.";
        if (response.status === 401 || response.status === 403) {
            errorMessage = "Stability AI API key invalid or unauthorized. Check Vercel environment variables.";
        } else if (response.status === 404 && errorData.message) {
            errorMessage = `Stability AI model not found: ${errorData.message}`; // More specific message
        } else if (response.status === 429) {
            errorMessage = "Stability AI API rate limit exceeded. Please try again shortly.";
        } else if (errorData.message) {
             errorMessage = `Stability AI error: ${errorData.message}`;
        }
        return res.status(500).json({ error: errorMessage });
    }

    const data = await response.json();
    console.log("Stability AI API Full Response Data:", JSON.stringify(data, null, 2));

    if (data.artifacts && data.artifacts[0]?.base64) {
      const imageBase64 = data.artifacts[0].base64;
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
