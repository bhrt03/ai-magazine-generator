import { useState } from "react";
import Head from "next/head";

export default function Home() {
  const [query, setQuery] = useState("");
  const [article, setArticle] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setArticle(data.article);
      setImages(data.images);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const downloadPDF = async () => {
    const element = document.getElementById("magazine");
    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf().from(element).save("magazine.pdf");
  };

  return (
    <>
      <Head>
        <title>AI Magazine Generator</title>
      </Head>
      <main className="min-h-screen p-6 bg-gray-100 font-sans">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6 text-gray-800">
            AI Magazine Generator 📰✨
          </h1>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a topic (e.g. Space Travel)"
            className="w-full p-3 border border-gray-300 rounded mb-4"
          />
          <button
            onClick={handleGenerate}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Magazine"}
          </button>
        </div>

        {article && (
          <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded shadow" id="magazine">
            <h2 className="text-3xl font-bold mb-4 text-center">{query}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Image ${idx}`}
                  className="w-full h-60 object-cover rounded"
                />
              ))}
            </div>
            <div className="text-gray-800 leading-relaxed whitespace-pre-line">{article}</div>
            <button
              onClick={downloadPDF}
              className="mt-6 bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
            >
              Download as PDF
            </button>
          </div>
        )}
      </main>
    </>
  );
}
