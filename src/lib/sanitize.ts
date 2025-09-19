import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window as unknown as Window;
const DOMPurify = createDOMPurify(window as any);

export function sanitizeHtml(dirty: string | undefined | null) {
  if (!dirty) return "";
  return DOMPurify.sanitize(dirty);
}
