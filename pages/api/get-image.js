export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const pexelsResponse = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
      {
        headers: {
          Authorization: process.env.PEXELS_API_KEY
        }
      }
    );

    if (!pexelsResponse.ok) {
      throw new Error(`Pexels API error: ${pexelsResponse.status}`);
    }

    const data = await pexelsResponse.json();
    res.status(200).json({ 
      imageUrl: data.photos[0]?.src?.medium || '' 
    });

  } catch (error) {
    console.error("Pexels error:", error);
    res.status(500).json({ 
      error: error.message || "Image search failed",
      details: error 
    });
  }
}
