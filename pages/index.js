const handleGenerate = async () => {
  setLoading(true);
  const response = await fetch("/api/generateContent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await response.json();
  setArticle(data.article);
  setLoading(false);
};
