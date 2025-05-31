import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setContent('');
    setImageUrl('');

    if (query.trim().toLowerCase() === 'future of education') {
      // Placeholder: Static image + article
      setImageUrl('https://images.unsplash.com/photo-1601933470928-c04dbf18a80a'); // Replace with any image
      setContent(
        `The Future of Education

Education is evolving rapidly with advancements in technology. The classroom is no longer limited by physical walls; instead, it's expanding into virtual environments, powered by tools such as virtual reality, artificial intelligence, and personalized learning algorithms.

In the coming years, education will be increasingly accessible, customized, and collaborative. AI will help identify individual student needs, enabling adaptive learning that caters to their pace and style. Online platforms will deliver high-quality content globally, breaking barriers of geography and economics.

Moreover, skills like creativity, problem-solving, and emotional intelligence will take center stage as automation transforms the job market. Education will be less about memorization and more about critical thinking and lifelong learning.

In essence, the future of education lies in its ability to be inclusive, innovative, and empowering for every learner across the globe.`
      );
    } else {
      setError('Content generation failed.');
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-center">AI Magazine Generator</h1>

        <input
          type="text"
          placeholder="Enter a topic..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-4 rounded-lg border border-gray-300"
        />

        <button
          onClick={handleGenerate}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>

        {imageUrl && (
          <img
            src={imageUrl}
            alt="Generated"
            className="w-full rounded-xl shadow-lg"
          />
        )}

        {content && (
          <div className="bg-white p-6 rounded-xl shadow-md whitespace-pre-wrap">
            {content}
          </div>
        )}

        {error && (
          <div className="text-red-600 text-center">{error}</div>
        )}
      </div>
    </main>
  );
}
