import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/**
 * Adds a watermark to a PDF and returns a Web ReadableStream
 */
export async function addUserWatermarkStream(
  buffer: Buffer | Uint8Array,
  name: string,
  idStr: string
): Promise<ReadableStream<Uint8Array>> {
  const pdfDoc = await PDFDocument.load(buffer);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  const text = `${name} • ${idStr}`;
  const fontSize = 9;
  const marginBottom = 12;

  for (const page of pages) {
    const { width } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const x = (width - textWidth) / 2;
    const y = marginBottom;

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.3, 0.3, 0.3),
      opacity: 0.5,
    });
  }

  const stamped = await pdfDoc.save(); // Uint8Array

  return new ReadableStream({
    start(controller) {
      controller.enqueue(stamped);
      controller.close();
    },
  });
}
