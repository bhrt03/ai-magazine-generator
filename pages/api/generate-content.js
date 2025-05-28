export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const content = `
      <h1>${prompt}</h1>
      <p>
        Welcome to our AI-generated magazine on <strong>${prompt}</strong>. This article dives into trends, facts, and highlights about the topic. Enjoy a magazine-style layout with text and visuals.
      </p>
      <p>
        This content is static placeholder. To generate AI-based content, connect OpenAI’s API.
      </p>
    `;

    const images = [
      'https://images.unsplash.com/photo-1506765515384-028b60a970df?fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?fit=crop&w=800&q=80'
    ];

    res.status(200).json({ content, images });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
