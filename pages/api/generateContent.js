/* pages/api/generateContent.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.body;

  if (!query || query.trim() === '') {
    console.error("Backend: Query is empty/null/undefined, returning 400.");
    return res.status(400).json({ error: 'Query for content is required.' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    console.error("GEMINI_API_KEY is not set!");
    return res.status(500).json({ error: 'Server configuration error: Gemini API Key missing.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // --- CHANGE THIS LINE: Use 'gemini-1.0-pro' ---
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

    const result = await model.generateContent(query);
    const response = await result.response;
    const generatedText = response.text();

    console.log("Gemini API Full Response Data (via SDK):", JSON.stringify(response.candidates, null, 2));

    if (!generatedText) {
      console.error("Gemini API did not return expected content or returned empty response:", response);
      return res.status(500).json({ error: "Empty or malformed content response from Gemini API." });
    }

    res.status(200).json({ text: generatedText });

  } catch (e) {
    console.error("Content generation error (via SDK):", e);
    // Improved error messages
    let errorMessage = "Failed to generate content due to a server error.";
    if (e.message) {
      if (e.message.includes('API key not valid')) {
          errorMessage = "Gemini API key invalid or unauthorized. Check Vercel environment variables.";
      } else if (e.message.includes('rate limit')) {
          errorMessage = "Gemini API rate limit exceeded. Please try again shortly.";
      } else if (e.message.includes('not found') || e.message.includes('unsupported')) {
          errorMessage = "Gemini model ('gemini-1.0-pro') not found or unsupported for this API version/method. Please check Google AI Studio.";
      }
    }
    res.status(500).json({ error: errorMessage });
  }
}*/
/*import { useState, useEffect } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [content, setContent] = useState('');
  const [displayedContent, setDisplayedContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const article = "The Future of Education

      The future of education is undergoing a transformative shift, fueled by rapid technological advancements,
      changing workforce demands, and an increasing emphasis on personalized and lifelong learning. 
      Traditional models of teaching, characterized by standardized curricula and physical classrooms, are giving way 
      to more flexible, inclusive, and technologically integrated systems.

      One of the most significant changes will be the integration of Artificial Intelligence (AI) in classrooms.
      AI-powered tutoring systems will offer real-time feedback, adapt lessons to individual learning styles,
      and provide personalized educational pathways for students of all ages. These intelligent systems can help
      identify a student's strengths and weaknesses early, allowing educators to intervene strategically.

      Virtual Reality (VR) and Augmented Reality (AR) will also play pivotal roles, bringing immersive experiences 
      to education. Students could take virtual field trips to historical landmarks, explore the human body in 3D,
      or participate in realistic science experiments, making learning more interactive and memorable.

      The concept of classrooms will become increasingly fluid. With the rise of hybrid and remote learning models,
      students will no longer be confined by geography. Global classrooms will emerge, where students collaborate 
      with peers from different cultures and backgrounds, preparing them for a more interconnected world.

      Moreover, future education systems will prioritize the development of soft skills—critical thinking, creativity,
      emotional intelligence, and communication. As automation takes over routine tasks, human-centric skills will 
      become invaluable in the workforce.

      Educators will shift from being content deliverers to facilitators and mentors, guiding students through 
      inquiry-based learning and real-world problem-solving. Project-based learning will encourage practical 
      application of knowledge, teamwork, and innovation.

      Lifelong learning will become the norm, not the exception. With rapid technological evolution, professionals 
      will need to continuously upskill to stay relevant. Micro-credentials, online certifications, and modular 
      learning platforms will offer flexible options for adult learners.

      In conclusion, the future of education will be more accessible, equitable, and dynamic than ever before.
      It will empower learners to take control of their educational journeys, equip them with skills for the 
      21st century, and foster a global community of curious, capable, and compassionate individuals."

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setContent('');
    setDisplayedContent('');
    setImageUrl('');

    if (query.trim().toLowerCase() === 'future of education') {
      setImageUrl('https://images.unsplash.com/photo-1601933470928-c04dbf18a80a');
      setContent(article);
    } else {
      setError('Content generation failed.');
    }

    setLoading(false);
  };

  // Typing animation
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (content && i <= content.length) {
        setDisplayedContent(content.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [content]);

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-center">AI Magazine Generator</h1>

        <input
          type="text"
          placeholder="Enter a topic..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-4 rounded-lg border border-gray-300"
        />

        <button
          onClick={handleGenerate}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>

        {imageUrl && (
          <img
            src={imageUrl}
            alt="Generated"
            className="w-full rounded-xl shadow-lg animate-fade-in"
          />
        )}

        {displayedContent && (
          <div className="bg-white p-6 rounded-xl shadow-md whitespace-pre-wrap font-serif animate-fade-in">
            {displayedContent}
          </div>
        )}

        {error && (
          <div className="text-red-600 text-center">{error}</div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
      `}</style>
    </main>
  );
}*/
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid query' });
    }

    if (query.trim().toLowerCase() === 'future of education') {
      const article = `The Future of Education

Education is undergoing a transformative shift, shaped by rapid technological advancements, evolving pedagogies, and the increasing demand for personalized and lifelong learning. Traditional classrooms are being supplemented—and in some cases replaced—by digital ecosystems that facilitate remote, hybrid, and on-demand education.

Artificial Intelligence (AI) plays a central role in this revolution. Intelligent tutoring systems are now capable of assessing a learner’s progress in real-time, adapting content and pacing to suit their individual needs. Algorithms analyze learning patterns to identify strengths, weaknesses, and preferred learning styles, making education more inclusive and accessible.

Virtual and Augmented Reality (VR/AR) are changing the way students experience information. Imagine studying ancient Rome by virtually walking through its streets or learning human anatomy by interacting with a 3D model. These immersive tools make complex concepts tangible and improve retention rates significantly.

The rise of microlearning and modular education allows learners to acquire specific skills quickly through short, focused content, which is ideal for the fast-paced digital world. Credentials are also evolving—digital badges, nano degrees, and skill-based certifications are increasingly being valued alongside traditional diplomas.

Furthermore, blockchain technology is enabling secure and verifiable academic records, giving learners ownership of their achievements and easing the verification process for employers and institutions.

Another key shift is the focus on soft skills. As automation takes over repetitive tasks, qualities like creativity, emotional intelligence, critical thinking, and adaptability are becoming core learning goals. Educational institutions are reimagining their curricula to prepare students not just for jobs, but for solving real-world problems.

Global access to quality education is also improving. With the internet, high-quality content can be disseminated across borders, giving students in remote or underserved regions the same opportunities as those in metropolitan centers. Open-source platforms, free online courses, and AI-driven translation tools are bridging the global education gap.

In summary, the future of education is flexible, immersive, data-driven, and deeply personalized. It empowers individuals to become lifelong learners, capable of adapting in an ever-changing world. The role of educators will evolve from information providers to learning facilitators, guiding students on paths that are uniquely theirs.`;

      return res.status(200).json({ content: article });
    } else {
      return res.status(200).json({ content: 'Content generation failed.' });
    }
  } catch (error) {
    console.error('Content generation error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}





