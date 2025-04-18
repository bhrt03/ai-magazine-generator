export default async function handler(req, res) {
  try {
    const { query } = req.query;
    const pexelsResponse = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
      {
        headers: {
          Authorization: process.env.PEXELS_API_KEY
        }
      }
    );
    const data = await pexelsResponse.json();
    res.status(200).json({ imageUrl: data.photos[0]?.src.medium || '' });
  } catch (error) {
    res.status(500).json({ imageUrl: '' });
  }
}
