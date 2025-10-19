import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/**
 * addUserWatermark
 * - buffer: original PDF buffer
 * - name: user name to stamp
 * - idStr: user id to stamp
 *
 * Returns Uint8Array (stamped pdf bytes).
 */
export async function addUserWatermark(
  buffer: Buffer | Uint8Array,
  name: string,
  idStr: string
): Promise<Uint8Array> {
  const existingPdfBytes =
    buffer instanceof Buffer ? buffer : Buffer.from(buffer);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

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

  const stamped = await pdfDoc.save();
  return stamped;
}
