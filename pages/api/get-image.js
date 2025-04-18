export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3`,
      { headers: { Authorization: process.env.PEXELS_API_KEY } }
    );

    if (!response.ok) throw new Error(`Pexels API error: ${response.status}`);

    const data = await response.json();
    const images = data.photos?.map(photo => ({
      url: photo.src.medium,
      photographer: photo.photographer,
      alt: photo.alt || query
    })) || [];

    res.status(200).json({ images });

  } catch (error) {
    console.error('Pexels Error:', error);
    // Fallback to placeholder images
    res.status(200).json({
      images: Array(3).fill({
        url: `https://placehold.co/600x400?text=${encodeURIComponent(query)}`,
        photographer: 'Placeholder',
        alt: query
      })
    });
  }
}
