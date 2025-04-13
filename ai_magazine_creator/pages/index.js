import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [query, setQuery] = useState("");
  const [article, setArticle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const generateArticle = async () => {
    setLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    const data = await response.json();
    setArticle(data.article);
    setImageUrl(data.image);
    setLoading(false);
  };

  const downloadPDF = () => {
    const element = document.getElementById("magazine");
    import("html2pdf.js").then(html2pdf => {
      html2pdf().from(element).save("magazine.pdf");
    });
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: 20 }}>
      <h1 style={{ fontSize: "2rem" }}>🧠 AI Magazine Creator</h1>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Enter topic..." style={{ width: "100%", padding: 10, marginTop: 20 }} />
      <button onClick={generateArticle} style={{ marginTop: 10, padding: 10 }} disabled={loading}>
        {loading ? "Generating..." : "Generate Magazine"}
      </button>
      {article && (
        <>
          <div id="magazine" style={{ marginTop: 30, backgroundColor: "#f4f4f4", padding: 20, borderRadius: 8 }}>
            <h2>{query}</h2>
            {imageUrl && <img src={imageUrl} alt="Topic" style={{ width: "100%", borderRadius: 8, marginBottom: 20 }} />}
            <p style={{ whiteSpace: "pre-line" }}>{article}</p>
          </div>
          <button onClick={downloadPDF} style={{ marginTop: 20, padding: 10 }}>Download PDF</button>
        </>
      )}
    </div>
  );
}
