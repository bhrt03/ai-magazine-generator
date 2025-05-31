import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setContent("");
    setImageUrl("");

    try {
      const contentRes = await fetch("/api/generateContent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const contentData = await contentRes.json();
      setContent(contentData.text || "Content generation failed.");
    } catch {
      setContent("Content generation failed.");
    }

    try {
      const imageRes = await fetch("/api/generateImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });

      const imageData = await imageRes.json();
      setImageUrl(imageData.imageUrl || "");
    } catch {
      setImageUrl("");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">AI Magazine Generator</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter a topic..."
        className="border border-gray-300 p-2 rounded w-full max-w-xl mb-4"
      />
      <button
        onClick={handleGenerate}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-6 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      <div className="w-full max-w-4xl space-y-8">
        {content && (
          <div className="bg-white p-4 rounded shadow text-gray-800 whitespace-pre-wrap">
            {content}
          </div>
        )}
        {imageUrl && (
          <div className="w-full flex justify-center">
            <img src={imageUrl} alt="Generated" className="rounded-lg max-w-full" />
          </div>
        )}
      </div>
    </div>
  );
}
