import React, { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [article, setArticle] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const contentRef = useRef(null);
  const [html2pdfInstance, setHtml2pdfInstance] = useState(null);

  // ✅ Load html2pdf.js only on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('html2pdf.js').then((mod) => {
        setHtml2pdfInstance(mod.default);
      });
    }
  }, []);

  const generateMagazine = async () => {
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
      alert('Error generating magazine');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (html2pdfInstance && contentRef.current) {
      html2pdfInstance().from(contentRef.current).save();
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>AI Magazine Generator 📰</h1>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter a topic..."
        style={{ width: '60%', padding: '10px', marginBottom: '1rem' }}
      />

      <button onClick={generateMagazine} disabled={loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>

      {article && (
        <>
          <div ref={contentRef} style={{ marginTop: '2rem', background: '#fff', padding: '1rem' }}>
            <h2>Magazine Article</h2>
            {images.map((img, index) => (
              <img key={index} src={img} alt={`Related ${index}`} style={{ width: '100%', marginBottom: '1rem' }} />
            ))}
            <p style={{ whiteSpace: 'pre-line' }}>{article}</p>
          </div>

          <button onClick={downloadPDF} style={{ marginTop: '1rem' }}>
            Download as PDF
          </button>
        </>
      )}
    </div>
  );
}
