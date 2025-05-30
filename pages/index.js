import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [article, setArticle] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setArticle('');
    setImage('');

    try {
      const contentRes = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const contentData = await contentRes.json();
      setArticle(contentData.content || 'Content generation failed.');

      const imageRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query }),
      });

      const imageData = await imageRes.json();
      if (imageData.image) {
        setImage(`data:image/png;base64,${imageData.image}`);
      } else {
        setImage('');
      }
    } catch (error) {
      setArticle('Something went wrong.');
      setImage('');
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>AI Magazine Generator</h1>
      <input
        type="text"
        placeholder="Enter a topic"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
      />
      <button
        onClick={handleGenerate}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>

      {article && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Generated Article</h2>
          <p>{article}</p>
        </div>
      )}

      {image && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Generated Image</h2>
          <img src={image} alt="Generated" style={{ maxWidth: '100%' }} />
        </div>
      )}
    </div>
  );
}
