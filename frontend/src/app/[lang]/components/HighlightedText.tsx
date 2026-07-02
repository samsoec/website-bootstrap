interface HighlightedTextProps {
  text: string;
  tag: string;
  className?: string;
  color?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default function HighlightedText({ text, tag, className, color }: HighlightedTextProps) {
  const tempText = text.split(" ");
  const result = [];

  result.push(`<${tag} class="${className ? className : ""}">`);

  tempText.forEach((word: string, index: number) => {
    if (word.includes("[")) {
      const highlight = escapeHtml(word.replace("[", "").replace("]", ""));
      result.push(`<span key=${index} class="${color ? color : ""}">${highlight}</span> `);
    } else result.push(escapeHtml(word) + " ");
  });

  result.push(`</${tag}>`);

  return <div dangerouslySetInnerHTML={{ __html: result.join("") }} />;
}
