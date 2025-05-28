import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setContent('');
    setImageUrl('');

    try {
      const contentRes = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const contentData = await contentRes.json();
      setContent(contentData.content);

      const imageRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const imageData = await imageRes.json();
      setImageUrl(imageData.imageUrl);
    } catch (err) {
      alert('Error generating magazine. Please try again.');
    }

    setLoading(false);
  };

  const handleDownloadPDF = async () => {
    const html = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 40px; }
            h1 { text-align: center; }
            img { max-width: 100%; margin: 20px auto; display: block; }
            p { text-align: justify; line-height: 1.6; font-size: 16px; }
          </style>
        </head>
        <body>
          <h1>${prompt}</h1>
          <img src="${imageUrl}" />
          <p>${content.replace(/\n/g, '<br/>')}</p>
        </body>
      </html>
    `;

    const pdfRes = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html }),
    });

    const blob = await pdfRes.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'magazine.pdf';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12 text-center">
      <h1 className="text-4xl font-bold mb-6">AI Magazine Creator</h1>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter a magazine topic..."
        className="w-full max-w-xl px-4 py-2 border rounded shadow-sm"
      />
      <button
        onClick={handleGenerate}
        disabled={loading || !prompt}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>

      {imageUrl && <img src={imageUrl} alt="Generated" className="mx-auto my-6 max-w-md rounded shadow" />}
      {content && (
        <div className="max-w-3xl mx-auto mt-6 text-left bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">{prompt}</h2>
          <p className="whitespace-pre-line leading-relaxed">{content}</p>
          <button
            onClick={handleDownloadPDF}
            className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Download as PDF
          </button>
        </div>
      )}
    </div>
  );
}
