import PDFDocument from "pdfkit";

export interface VocabWord {
  word: string;
  definition: string;
}

export function generateVocabPDF(data: {
  weekOf: string;
  className?: string;
  words: VocabWord[];
  sentences: string[];
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 60 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header bar
    doc.rect(0, 0, doc.page.width, 80).fill("#4F46E5");

    doc
      .fillColor("white")
      .fontSize(26)
      .font("Helvetica-Bold")
      .text("Weekly Vocabulary Sheet", 60, 22, { align: "left" });

    const subtitle = [data.className, `Week of ${data.weekOf}`]
      .filter(Boolean)
      .join("  ·  ");
    doc.fontSize(11).font("Helvetica").text(subtitle, 60, 54, { align: "left" });

    doc.fillColor("#1F2937");

    // Vocabulary section
    doc.moveDown(3.5);
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#4F46E5")
      .text("VOCABULARY WORDS");

    doc.moveTo(60, doc.y + 4).lineTo(doc.page.width - 60, doc.y + 4).strokeColor("#E5E7EB").stroke();
    doc.moveDown(0.8);

    data.words.forEach((item, i) => {
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .fillColor("#111827")
        .text(`${i + 1}.  ${item.word}`, { continued: false });

      doc
        .fontSize(11)
        .font("Helvetica")
        .fillColor("#4B5563")
        .text(`     ${item.definition}`);

      doc.moveDown(0.5);
    });

    // Sentences section
    doc.moveDown(1);
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#4F46E5")
      .text("EXAMPLE SENTENCES");

    doc.moveTo(60, doc.y + 4).lineTo(doc.page.width - 60, doc.y + 4).strokeColor("#E5E7EB").stroke();
    doc.moveDown(0.8);

    data.sentences.forEach((sentence, i) => {
      doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("#111827")
        .text(`${i + 1}.  ${sentence}`);
      doc.moveDown(0.5);
    });

    // Footer
    const footerY = doc.page.height - 40;
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#9CA3AF")
      .text(`Generated automatically · EduDash`, 60, footerY, { align: "center" });

    doc.end();
  });
}
