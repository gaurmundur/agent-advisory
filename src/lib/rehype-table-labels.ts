// Rehype plugin for MDX tables: copies each column header onto the cells below it as
// data-label="...", so on phones a row can be shown as a small card with the labels inline
// (see src/components/article/Table.astro). Runs at build time; no JavaScript in the browser.
interface Node {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
}

const elements = (node: Node, tagName: string): Node[] =>
  (node.children ?? []).filter((child) => child.type === "element" && child.tagName === tagName);

const textOf = (node: Node): string =>
  node.type === "text" ? (node.value ?? "") : (node.children ?? []).map(textOf).join("");

function labelTable(table: Node) {
  const [thead] = elements(table, "thead");
  const [headerRow] = thead ? elements(thead, "tr") : [];
  if (!headerRow) return;
  const labels = elements(headerRow, "th").map((th) => textOf(th).trim());
  for (const tbody of elements(table, "tbody")) {
    for (const row of elements(tbody, "tr")) {
      elements(row, "td").forEach((td, index) => {
        const label = labels[index];
        if (label) td.properties = { ...td.properties, dataLabel: label };
      });
    }
  }
}

function walk(node: Node) {
  if (node.type === "element" && node.tagName === "table") labelTable(node);
  node.children?.forEach(walk);
}

export default function rehypeTableLabels() {
  return (tree: Node) => walk(tree);
}
