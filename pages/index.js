import { useState } from 'react';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [article, setArticle] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);

    const contentRes = await fetch('/api/generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });
    const contentData = await contentRes.json();
    setArticle(contentData.content);

    const imageRes = await fetch('/api/generateImage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: topic })
    });
    const imageData = await imageRes.json();
    setImage(imageData.image);

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">AI Magazine Generator</h1>
      <input
        type="text"
        placeholder="Enter a topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="p-2 border border-gray-400 rounded w-full max-w-md mb-4"
      />
      <button
        onClick={handleGenerate}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>

      {article && (
        <div className="mt-8 w-full max-w-3xl bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Generated Article</h2>
          <p className="whitespace-pre-line">{article}</p>
        </div>
      )}

      {image && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Generated Image</h2>
          <img src={image} alt="Generated" className="max-w-full rounded shadow" />
        </div>
      )}
    </div>
  );
}
