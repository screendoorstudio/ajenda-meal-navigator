import * as fs from 'fs';
import * as path from 'path';

async function extractTextFromPdf(pdfPath: string): Promise<string> {
  // Dynamic import for pdfjs-dist legacy build for Node.js
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

  const dataBuffer = fs.readFileSync(pdfPath);
  const data = new Uint8Array(dataBuffer);

  const doc = await pdfjsLib.getDocument({ data }).promise;
  let fullText = '';

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: unknown) => (item as { str: string }).str)
      .join(' ');
    fullText += `\n\n=== PAGE ${i} ===\n${pageText}`;
  }

  return fullText;
}

async function main() {
  const pdfPath = path.resolve(__dirname, '../../pdfs/PHASE 1/Nutrition_Week 1.pdf');

  console.log('Extracting text from:', pdfPath);
  const text = await extractTextFromPdf(pdfPath);

  // Print first 10000 characters to see the structure
  console.log('=== PDF TEXT PREVIEW (first 10000 chars) ===');
  console.log(text.substring(0, 10000));
}

main().catch(console.error);
