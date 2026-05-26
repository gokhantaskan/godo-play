import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

// Force safe rel on links that open a new tab to prevent reverse tabnabbing
DOMPurify.addHook("afterSanitizeAttributes", node => {
  if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer");
  }
});

export function sanitizeHtml(html: string | null | undefined): string | null {
  if (!html) {
    return null;
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "ul",
      "ol",
      "li",
      "a",
      "h3",
      "h4",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
}
