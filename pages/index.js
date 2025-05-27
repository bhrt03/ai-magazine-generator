import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

  const downloadPDF = async () => {
    const element = document.getElementById("magazine-content");
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 0;

    if (imgHeight > pageHeight) {
      let heightLeft = imgHeight;

      while (heightLeft > 0) {
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        if (heightLeft > 0) {
          pdf.addPage();
          position = 0;
        }
      }
    } else {
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    }

    pdf.save("magazine.pdf");
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

      <div className="flex gap-4 mb-4">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Generating..." : "Generate"}
        </button>

        {article && (
          <button
            onClick={downloadPDF}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Download as PDF
          </button>
        )}
      </div>

      {article && (
        <div
          id="magazine-content"
          className="bg-white p-6 rounded shadow whitespace-pre-line"
        >
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Magazine Visual"
              className="w-full h-auto rounded-lg mb-4"
            />
          )}
          <div>{article}</div>
        </div>
      )}
    </div>
  );
}
