import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { html } = req.body;

  if (!html) {
    return res.status(400).json({ error: 'Missing HTML content' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=magazine.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({ error: 'PDF generation failed.' });
  }
}
