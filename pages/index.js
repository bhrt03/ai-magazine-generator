import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [magazineContent, setMagazineContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const generateMagazine = async () => {
    setLoading(true);
    
    try {
      // Step 1: Generate content via Next.js API route
      const contentRes = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      const { content } = await contentRes.json();
      setMagazineContent(content);

      // Step 2: Fetch image from Pexels
      const imageRes = await fetch(`/api/get-image?query=${encodeURIComponent(topic)}`);
      const { imageUrl } = await imageRes.json();
      setImageUrl(imageUrl);

    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>AI Magazine Generator</title>
      </Head>
      <main>
        <h1>AI Magazine Generator</h1>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic"
        />
        <button onClick={generateMagazine} disabled={loading}>
          {loading ? 'Generating...' : 'Create Magazine'}
        </button>
        
        {imageUrl && <img src={imageUrl} alt={topic} style={{ maxWidth: '100%' }} />}
        {magazineContent && (
          <div className="magazine-content">
            <h2>{topic}</h2>
            <p>{magazineContent}</p>
          </div>
        )}
      </main>
    </div>
  );
}
