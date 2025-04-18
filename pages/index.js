// Add this at the top of your file
import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [magazineContent, setMagazineContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState(''); // New error state

  const generateMagazine = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Generate Content
      const contentRes = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      if (!contentRes.ok) throw new Error('Content generation failed');
      const { content } = await contentRes.json();

      // Get Image
      const imageRes = await fetch(`/api/get-image?query=${encodeURIComponent(topic)}`);
      if (!imageRes.ok) throw new Error('Image search failed');
      const { imageUrl } = await imageRes.json();

      // Update state
      setMagazineContent(content);
      setImageUrl(imageUrl || '/placeholder.jpg');

    } catch (err) {
      setError(err.message);
      console.error("Generation error:", err);
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
          disabled={loading}
        />
        <button 
          onClick={generateMagazine} 
          disabled={loading || !topic.trim()}
        >
          {loading ? 'Generating...' : 'Generate Magazine'}
        </button>
        
        {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
        
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={topic} 
            style={{ maxWidth: '100%', marginTop: '20px' }}
          />
        )}
        
        {magazineContent && (
          <div style={{ marginTop: '20px' }}>
            <h2>{topic}</h2>
            <p>{magazineContent}</p>
          </div>
        )}
      </main>
    </div>
  );
}
