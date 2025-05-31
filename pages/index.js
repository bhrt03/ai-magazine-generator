import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    // --- Added check: Prevent API calls if query is empty ---
    if (!query.trim()) { // .trim() ensures it's not just whitespace
      alert("Please enter a topic to generate content.");
      return;
    }

    setLoading(true);
    setContent(""); // Clear previous content
    setImageUrl(""); // Clear previous image

    // --- Generate Article Content ---
    try {
      console.log("Frontend: Sending query to /api/generateContent:", query);
      const contentRes = await fetch("/api/generateContent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }), // Sending 'query' as per backend's expectation
      });

      // Check if the response itself was OK (e.g., not 400, 500)
      if (!contentRes.ok) {
        const errorBody = await contentRes.json().catch(() => ({}));
        console.error("Frontend: generateContent API responded with an error:", contentRes.status, contentRes.statusText, errorBody);
        setContent(errorBody.error || "Content generation failed (server error).");
      } else {
        const contentData = await contentRes.json();
        // Backend should send 'text', so setting 'text' here
        setContent(contentData.text || "Content generation failed (no text in response).");
      }
    } catch (error) {
      console.error("Frontend: Error calling generateContent API:", error);
      setContent("Content generation failed (network or unexpected error).");
    }

    // --- Generate Image ---
    try {
      console.log("Frontend: Sending prompt for image to /api/generateImage:", query);
      const imageRes = await fetch("/api/generateImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }), // Sending 'prompt' for image, using 'query'
      });

      if (!imageRes.ok) {
        const errorBody = await imageRes.json().catch(() => ({}));
        console.error("Frontend: generateImage API responded with an error:", imageRes.status, imageRes.statusText, errorBody);
        setImageUrl(""); // Don't show broken image
      } else {
        const imageData = await imageRes.json();
        // Backend should send 'imageUrl', setting 'imageUrl' here
        setImageUrl(imageData.imageUrl || "");
      }
    } catch (error) {
      console.error("Frontend: Error calling generateImage API:", error);
      setImageUrl(""); // Don't show broken image
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
