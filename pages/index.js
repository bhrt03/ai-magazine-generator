import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateMagazine = async () => {
    setLoading(true);
    setContent('');
    setImages([]);

    try {
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error('Failed to generate content');
      const data = await res.json();
      setContent(data.content);
      setImages(data.images);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            img { width: 100%; margin-bottom: 20px; border-radius: 8px; }
            h1, h2 { color: #333; }
            p { font-size: 16px; line-height: 1.6; }
          </style>
        </head>
        <body>
          ${images.map(src => `<img src="${src}" />`).join('')}
          <div>${content.replace(/\n/g, '<br/>')}</div>
        </body>
      </html>
    `;

    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
      });

      if (!res.ok) throw new Error('Failed to generate PDF');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'magazine.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-6">AI Magazine Generator</h1>
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Enter a topic..."
          className="w-full border px-4 py-2 rounded mb-4"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="flex gap-4">
          <button
            onClick={generateMagazine}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Generate Magazine
          </button>
          <button
            onClick={downloadPDF}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Download PDF
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center mt-6 text-lg text-gray-600">Generating...</div>
      )}

      {!loading && (content || images.length > 0) && (
        <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
          {images.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Generated ${index}`}
              className="mb-4 rounded"
            />
          ))}
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
          />
        </div>
      )}
    </div>
  );
}
