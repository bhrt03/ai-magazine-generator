import { useState } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState(null);

  const generate = async () => {
    setLoading(true);
    const res = await axios.post("/api/generate", { topic });
    setArticle(res.data);
    setLoading(false);
  };

  const downloadPDF = () => {
    const element = document.getElementById("magazine");
    html2pdf().from(element).save("magazine.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-6">AI Magazine Generator</h1>
      <div className="flex justify-center mb-6">
        <input
          className="border px-4 py-2 mr-2 w-1/2"
          placeholder="Enter a topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <button onClick={generate} className="bg-blue-600 text-white px-4 py-2 rounded">
          Generate
        </button>
      </div>
      {loading && <p className="text-center">Generating content...</p>}
      {article && (
        <>
          <div id="magazine" className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">{article.title}</h2>
            {article.images.map((img, i) => (
              <img key={i} src={img} alt="related" className="w-full mb-4 rounded" />
            ))}
            <p className="text-lg leading-relaxed whitespace-pre-line">{article.content}</p>
          </div>
          <div className="text-center mt-6">
            <button onClick={downloadPDF} className="bg-green-600 text-white px-4 py-2 rounded">
              Download as PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}