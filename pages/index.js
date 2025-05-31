import { useState, useEffect } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [content, setContent] = useState('');
  const [displayedContent, setDisplayedContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const article = `The Future of Education

Education is undergoing a transformative shift, shaped by rapid technological advancements, evolving pedagogies, and the increasing demand for personalized and lifelong learning. Traditional classrooms are being supplemented—and in some cases replaced—by digital ecosystems that facilitate remote, hybrid, and on-demand education.

Artificial Intelligence (AI) plays a central role in this revolution. Intelligent tutoring systems are now capable of assessing a learner’s progress in real-time, adapting content and pacing to suit their individual needs. Algorithms analyze learning patterns to identify strengths, weaknesses, and preferred learning styles, making education more inclusive and accessible.

Virtual and Augmented Reality (VR/AR) are changing the way students experience information. Imagine studying ancient Rome by virtually walking through its streets or learning human anatomy by interacting with a 3D model. These immersive tools make complex concepts tangible and improve retention rates significantly.

The rise of microlearning and modular education allows learners to acquire specific skills quickly through short, focused content, which is ideal for the fast-paced digital world. Credentials are also evolving—digital badges, nano degrees, and skill-based certifications are increasingly being valued alongside traditional diplomas.

Furthermore, blockchain technology is enabling secure and verifiable academic records, giving learners ownership of their achievements and easing the verification process for employers and institutions.

Another key shift is the focus on soft skills. As automation takes over repetitive tasks, qualities like creativity, emotional intelligence, critical thinking, and adaptability are becoming core learning goals. Educational institutions are reimagining their curricula to prepare students not just for jobs, but for solving real-world problems.

Global access to quality education is also improving. With the internet, high-quality content can be disseminated across borders, giving students in remote or underserved regions the same opportunities as those in metropolitan centers. Open-source platforms, free online courses, and AI-driven translation tools are bridging the global education gap.

In summary, the future of education is flexible, immersive, data-driven, and deeply personalized. It empowers individuals to become lifelong learners, capable of adapting in an ever-changing world. The role of educators will evolve from information providers to learning facilitators, guiding students on paths that are uniquely theirs.`;

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

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (content && i <= content.length) {
        setDisplayedContent(content.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 10);
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
}
