import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { GainLoss } from './taxCalculator';

export async function generateForm8949PDF(gainsLosses: GainLoss[], userId: string): Promise<string> {
  const doc = new PDFDocument({ margin: 30 });
  const filePath = path.join(__dirname, '../../reports', `form8949_${userId}_${Date.now()}.pdf`);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(18).text('IRS Form 8949 - Sales and Other Dispositions of Capital Assets', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('Taxpayer: ' + userId);
  doc.moveDown();

  // Table header
  doc.font('Helvetica-Bold').text('Asset', 50, doc.y, { continued: true })
    .text('Date Acquired', 120, doc.y, { continued: true })
    .text('Date Sold', 210, doc.y, { continued: true })
    .text('Proceeds', 300, doc.y, { continued: true })
    .text('Cost Basis', 370, doc.y, { continued: true })
    .text('Gain/Loss', 450, doc.y, { continued: true })
    .text('Exchange', 520, doc.y);
  doc.font('Helvetica');

  for (const row of gainsLosses) {
    doc.text(row.asset, 50, doc.y, { continued: true })
      .text(row.dateAcquired, 120, doc.y, { continued: true })
      .text(row.dateSold, 210, doc.y, { continued: true })
      .text(row.proceeds.toFixed(2), 300, doc.y, { continued: true })
      .text(row.costBasis.toFixed(2), 370, doc.y, { continued: true })
      .text(row.gainOrLoss.toFixed(2), 450, doc.y, { continued: true })
      .text(row.exchange, 520, doc.y);
  }

  doc.end();
  await new Promise<void>((resolve) => stream.on('finish', () => resolve()));
  return filePath;
}
