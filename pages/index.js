import { useState } from 'react';
import { generate } from 'ai';
import { jsPDF } from 'jspdf';
import axios from 'axios';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [magazineContent, setMagazineContent] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      // Generate magazine content with OpenAI
      const response = await generate({
        model: 'openai/gpt-3.5-turbo',
        prompt: `Create a 500-word magazine-style article about "${topic}". Include a title, introduction, 3 sections with subheadings, and a conclusion. Add 3 placeholder image descriptions like "[Image: Description]".`,
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      });

      // Handle response based on Vercel AI SDK version
      const text = response.text || response.choices?.[0]?.text || '';
      if (!text) throw new Error('No content generated');
      setMagazineContent(text);

      // Fetch images from Unsplash
      const unsplashResponse = await axios.get(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(topic)}&per_page=3&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`
      );
      const imageUrls = unsplashResponse.data.results.map((img) => ({
        url: img.urls.regular,
        alt: img.alt_description || `Image related to ${topic}`,
      }));
      setImages(imageUrls);
    } catch (err) {
      console.error(err);
      setError('Failed to generate content or fetch images. Check your API keys or try again.');
    }
    setLoading(false);
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Your Magazine', 10, 10);
      doc.setFontSize(12);
      let yOffset = 20;
      const lines = doc.splitTextToSize(magazineContent || 'No content', 190);
      lines.forEach((line) => {
        if (yOffset > 280) {
          doc.addPage();
          yOffset = 10;
        }
        doc.text(line, 10, yOffset);
        yOffset += 7;
      });
      images.forEach((img, i) => {
        if (yOffset > 280) {
          doc.addPage();
          yOffset = 10;
        }
        doc.text(`[Image ${i + 1}: ${img.alt}]`, 10, yOffset);
        yOffset += 10;
      });
      doc.save('magazine.pdf');
    } catch (err) {
      console.error(err);
      setError('Failed to generate PDF. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">AI Magazine Creator</h1>
      <input
        className="w-full max-w-md p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter a topic (e.g., Space Exploration)"
      />
      <button
        className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 ${loading ? 'cursor-not-allowed' : ''}`}
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Magazine'}
      </button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {magazineContent && (
        <div className="mt-8 w-full max-w-3xl bg-white p-6 rounded-lg shadow-lg">
          <div className="prose max-w-none">
            {magazineContent.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {images.map((img, i) => (
              <div key={i} className="text-center">
                <img src={img.url} alt={img.alt} className="w-full h-48 object-cover rounded-lg" />
                <p className="text-sm text-gray-600 mt-2">{img.alt}</p>
              </div>
            ))}
          </div>
          <button
            className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={handleDownloadPDF}
          >
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
}
