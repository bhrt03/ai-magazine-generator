import { useState } from 'react';
import { createChat } from 'ai';
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
    let contentGenerated = false;

    // Try OpenAI API
    try {
      const chat = createChat({
        model: 'gpt-3.5-turbo',
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      });
      const response = await chat.start({
        messages: [
          {
            role: 'user',
            content: `Create a 500-word magazine-style article about "${topic}". Include a title, introduction, 3 sections with subheadings, and a conclusion. Add 3 placeholder image descriptions like "[Image: Description]".`,
          },
        ],
      });
      const text = response.choices[0]?.message?.content || '';
      if (!text) throw new Error('No content generated');
      setMagazineContent(text);
      contentGenerated = true;
    } catch (err) {
      console.error('OpenAI Error:', err);
      setError('Failed to generate content. Check your OpenAI API key or try again.');
    }

    // Try Pexels API
    try {
      const pexelsResponse = await axios.get(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(topic)}&per_page=3`,
        {
          headers: {
            Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY,
          },
        }
      );
      const imageUrls = pexelsResponse.data.photos.map((photo) => ({
        url: photo.src.medium,
        alt: photo.alt || `Image related to ${topic}`,
      }));
      setImages(imageUrls);
    } catch (err) {
      console.error('Pexels Error:', err);
      // Fallback to placeholder images
      setImages([
        { url: 'https://via.placeholder.com/600x400?text=Image+1', alt: 'Placeholder Image 1' },
        { url: 'https://via.placeholder.com/600x400?text=Image+2', alt: 'Placeholder Image 2' },
        { url: 'https://via.placeholder.com/600x400?text=Image+3', alt: 'Placeholder Image 3' },
      ]);
      if (contentGenerated) {
        setError('Generated content, but failed to fetch Pexels images. Using placeholders.');
      } else {
        setError('Failed to generate content and fetch images. Check API keys.');
      }
    }

    setLoading(false);
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Magazine: ' + topic, 20, 50);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('Generated by AI Magazine Creator', 20, 70);
      if (images[0]) {
        doc.text('[Cover Image: ' + images[0].alt + ']', 20, 90);
      }
      doc.addPage();

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Your Magazine', 10, 10);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      let yOffset = 20;
      const lines = doc.splitTextToSize(magazineContent || 'No content', 190);
      lines.forEach((line) => {
        if (yOffset > 280) {
          doc.addPage();
          yOffset = 10;
        }
        if (line.match(/^(#{1,3})\s/)) {
          doc.setFont('helvetica', 'bold');
          doc.text(line.replace(/#{1,3}\s/, ''), 10, yOffset);
          doc.setFont('helvetica', 'normal');
        } else {
          doc.text(line, 10, yOffset);
        }
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
        <div className="mt-8 w-full max-w-3xl bg-white p-6 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 prose max-w-none">
            {magazineContent.split('\n').map((line, i) => {
              const imageMatch = line.match(/\[Image \d+: [^\]]+\]/);
              if (imageMatch) {
                const imageIndex = parseInt(line.match(/\d+/)[0]) - 1;
                return images[imageIndex] ? (
                  <div key={i} className="my-4">
                    <img src={images[imageIndex].url} alt={images[imageIndex].alt} className="w-full h-48 object-cover rounded-lg" />
                    <p className="text-sm text-gray-600 mt-2">{images[imageIndex].alt}</p>
                  </div>
                ) : (
                  <p key={i}>{line}</p>
                );
              }
              return <p key={i}>{line}</p>;
            })}
          </div>
          <div className="col-span-1">
            {images.map((img, i) => (
              <div key={i} className="mb-4">
                <img src={img.url} alt={img.alt} className="w-full h-32 object-cover rounded-lg" />
                <p className="text-xs text-gray-600 mt-1">{img.alt}</p>
              </div>
            ))}
          </div>
          <button
            className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 col-span-3"
            onClick={handleDownloadPDF}
          >
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
}
