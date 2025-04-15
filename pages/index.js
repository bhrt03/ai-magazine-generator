import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [article, setArticle] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const contentRef = useRef(null);
  const [html2pdf, setHtml2pdf] = useState(null);

  // Load html2pdf.js only on the client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('html2pdf.js').then((mod) => {
        setHtml2pdf(() => mod.default);
      });
    }
  }, []);

  const generate = async () => {
    if (!query) return alert('Please enter a topic.');

    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setArticle(data.article);
      setImages(data.images);
    } catch (err) {
      alert('Failed to generate magazine.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (html2pdf && contentRef.current) {
      html2pdf().from(contentRef.current).save(`${query}-magazine.pdf`);
    } else {
      alert('PDF generator not ready.');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', background: '#f9f9f9' }}>
      <h1 style={{ textAlign: 'center' }}>🧠 AI Magazine Generator</h1>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Enter a topic..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            padding: '10px',
            width: '50%',
            fontSize: '16px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            marginRight: '10px',
          }}
        />
        <button
          onClick={generate}
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            borderRadius: '6px',
            background: '#0070f3',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {article && (
        <div>
          <div
            ref={contentRef}
            style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '800px',
              margin: '0 auto',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            }}
          >
            <h2>{query.charAt(0).toUpperCase() + query.slice(1)} Magazine</h2>

            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`related-${i}`}
                style={{ width: '100%', margin: '20px 0', borderRadius: '6px' }}
              />
            ))}

            <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6', fontSize: '17px' }}>{article}</p>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              onClick={downloadPDF}
              style={{
                padding: '10px 25px',
                fontSize: '16px',
                borderRadius: '6px',
                background: '#28a745',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Download as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
