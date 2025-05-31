import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setContent('');
    setImageUrl('');

    try {
      const contentRes = await fetch('/api/generateContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const contentData = await contentRes.json();
      setContent(contentData.content || 'Content generation failed.');
    } catch {
      setContent('Content generation failed.');
    }

    try {
      const imageRes = await fetch('/api/generateImage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query }),
      });

      const imageData = await imageRes.json();
      setImageUrl(imageData.imageUrl || '');
    } catch {
      setImageUrl('');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">AI Magazine Generator</h1>

      <input
        className="border border-gray-400 p-2 rounded w-full max-w-md mb-4"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your topic..."
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>

      {content && (
        <div className="mt-8 w-full max-w-3xl text-lg leading-relaxed animate-fade-in">
          {content}
        </div>
      )}

      {imageUrl && (
        <div className="mt-8 w-full max-w-3xl flex justify-center animate-fade-in">
          <img src={imageUrl} alt="Generated visual" className="rounded-xl shadow-md max-w-full" />
        </div>
      )}
    </div>
  );
}
