import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setPdfBlob(null);

    try {
      const contentRes = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const contentData = await contentRes.json();

      const imageRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const imageData = await imageRes.json();

      const pdfRes = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          content: contentData.content,
          imageUrl: imageData.imageUrl,
        }),
      });

      const blob = await pdfRes.blob();
      setPdfBlob(blob);
    } catch (err) {
      console.error('Error generating magazine:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-center">AI Magazine Generator</h1>

      <textarea
        className="w-full max-w-xl p-4 rounded border border-gray-300 focus:outline-none focus:ring focus:border-blue-500"
        rows={4}
        placeholder="Enter your magazine topic..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        onClick={handleGenerate}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        Generate Magazine
      </button>

      {loading && (
        <div className="text-center mt-6">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          <p className="text-sm text-gray-600 mt-2">Generating magazine...</p>
        </div>
      )}

      {pdfBlob && (
        <a
          href={URL.createObjectURL(pdfBlob)}
          download="magazine.pdf"
          className="mt-6 inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Download Magazine PDF
        </a>
      )}
    </div>
  );
}
