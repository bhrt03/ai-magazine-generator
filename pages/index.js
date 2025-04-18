import { useState } from 'react';
import { OpenAI } from 'openai'; // Correct OpenAI import
import Head from 'next/head';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [magazineContent, setMagazineContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const generateMagazine = async () => {
    setLoading(true);
    
    try {
      // Initialize OpenAI
      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // Ensure this is set in Vercel env
      });

      // Generate content using OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a creative magazine writer." },
          { role: "user", content: `Write a short magazine article about ${topic}` },
        ],
      });

      const content = response.choices[0].message.content;
      setMagazineContent(content);

      // Fetch image from Pexels (replace with your Pexels API key)
      const pexelsResponse = await fetch(
        `https://api.pexels.com/v1/search?query=${topic}&per_page=1`,
        {
          headers: {
            Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY,
          },
        }
      );
      const pexelsData = await pexelsResponse.json();
      setImageUrl(pexelsData.photos[0]?.src.medium || '');

    } catch (error) {
      console.error("Error generating magazine:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Head>
        <title>AI Magazine Generator</title>
      </Head>
      <main>
        <h1>AI Magazine Generator</h1>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic"
        />
        <button onClick={generateMagazine} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Magazine'}
        </button>
        
        {imageUrl && <img src={imageUrl} alt={topic} />}
        {magazineContent && (
          <div>
            <h2>Your AI-Generated Magazine:</h2>
            <p>{magazineContent}</p>
          </div>
        )}
      </main>
    </div>
  );
}
