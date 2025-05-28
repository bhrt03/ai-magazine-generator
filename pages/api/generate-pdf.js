import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { article, imageUrl } = req.body;

  if (!article || !imageUrl) {
    return res.status(400).json({ error: "Missing article or image URL" });
  }

  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    // Set margins and layout
    const margin = 50;
    const contentWidth = width - margin * 2;
    const contentHeight = height - margin * 2;

    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Fetch and embed image
    const imageBytes = await fetch(imageUrl).then((res) => res.arrayBuffer());
    const image = await pdfDoc.embedJpg(imageBytes);
    const imgDims = image.scale(0.5);
    const imageY = height - margin - imgDims.height;

    page.drawImage(image, {
      x: (width - imgDims.width) / 2,
      y: imageY,
      width: imgDims.width,
      height: imgDims.height,
    });

    // Draw title
    const title = "AI Magazine";
    const fontSize = 24;
    page.drawText(title, {
      x: margin,
      y: imageY - 30,
      size: fontSize,
      font: titleFont,
      color: rgb(0, 0, 0.6),
    });

    // Draw article text with wrapping
    const articleFontSize = 12;
    const textY = imageY - 60;
    const lines = splitTextIntoLines(article, font, articleFontSize, contentWidth);

    let y = textY;
    for (const line of lines) {
      if (y < margin + 20) {
        // Add new page if needed
        const newPage = pdfDoc.addPage();
        y = height - margin;
        newPage.drawText(line, {
          x: margin,
          y,
          size: articleFontSize,
          font,
          color: rgb(0.1, 0.1, 0.1),
        });
        page = newPage;
        continue;
      }

      page.drawText(line, {
        x: margin,
        y,
        size: articleFontSize,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= articleFontSize + 4;
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=magazine.pdf");
    res.status(200).send(Buffer.from(pdfBytes));
  } catch (error) {
    res.status(500).json({ error: "Failed to generate PDF" });
  }
}

// Utility to wrap text into lines
function splitTextIntoLines(text, font, fontSize, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const width = font.widthOfTextAtSize(testLine, fontSize);

    if (width > maxWidth && line !== "") {
      lines.push(line.trim());
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }

  if (line) lines.push(line.trim());
  return lines;
}
