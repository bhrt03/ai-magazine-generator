const generateMagazine = async () => {
  setLoading(true);
  setError('');
  
  try {
    // First try content generation
    const contentRes = await fetch('/api/generate-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });

    if (!contentRes.ok) {
      const errorData = await contentRes.json();
      throw new Error(errorData.error || 'Content generation failed');
    }

    const { content } = await contentRes.json();
    setMagazineContent(content);

    // Then try image generation
    const imageRes = await fetch(`/api/get-image?query=${encodeURIComponent(topic)}`);
    if (!imageRes.ok) {
      throw new Error('Image generation failed (but content was created)');
    }
    const { images } = await imageRes.json();
    setImages(images);

  } catch (err) {
    console.error('Generation error:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
