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
        Welcome to our AI-generated magazine feature on <strong>${prompt}</strong>.
        This article explores key insights, trends, and exciting developments on this topic.
        Stay engaged as we take you through a vivid magazine-style journey.
      </p>
      <p>
        This is a placeholder content block. You can integrate OpenAI API to generate dynamic content
        for your magazine in production.
      </p>
    `;

    const images = [
      'https://source.unsplash.com/800x400/?technology',
      'https://source.unsplash.com/800x400/?innovation',
      'https://source.unsplash.com/800x400/?future',
    ];

    res.status(200).json({ content, images });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
