import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [article, setArticle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setArticle("");
    setImageUrl("");

    try {
      const contentRes = await fetch("/api/generateContent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const contentData = await contentRes.json();
      setArticle(contentData.article);

      const imageRes = await fetch("/api/generateImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const imageData = await imageRes.json();
      setImageUrl(imageData.imageUrl);
    } catch (err) {
      alert("Error generating magazine content or image");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">AI Magazine Generator</h1>
      <textarea
        className="w-full border p-2 rounded mb-4"
        rows={4}
        placeholder="Enter a topic..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Magazine Visual"
          className="w-full h-auto rounded-lg mb-4"
        />
      )}

      {article && (
        <div className="bg-white p-6 rounded shadow whitespace-pre-line">
          {article}
        </div>
      )}
    </div>
  );
}
