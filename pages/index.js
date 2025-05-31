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
          alt="Generated visual"
          className="w-full rounded-xl shadow-lg"
        />
      )}

      {content && (
        <div className="bg-white p-6 rounded-xl shadow-md whitespace-pre-wrap">
          {content}
        </div>
      )}

      {error && (
        <div className="text-red-600 text-center">{error}</div>
      )}
    </div>
  </main>
);
