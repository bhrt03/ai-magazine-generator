import { useState } from 'react';

export default function DownloadButton({ htmlContent }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: htmlContent })
      });

      if (!res.ok) throw new Error('Failed to generate PDF');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'magazine.pdf';
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleDownload} disabled={loading}>
      {loading ? 'Generating PDF...' : 'Download PDF'}
    </button>
  );
}
