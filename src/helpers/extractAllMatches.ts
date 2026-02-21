function extractAllMatches(html: string, pattern: RegExp): string[] {
  const matches: string[] = [];
  let match;
  while ((match = pattern.exec(html)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
}

function extractProductBoxes(html: string): string[] {
  // Extract individual product boxes from listing page
  const productBoxPattern =
    /<div class="ProductBoxVertical[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
  const boxes: string[] = [];
  let match;

  while ((match = productBoxPattern.exec(html)) !== null) {
    boxes.push(match[0]);
  }

  return boxes;
}

export default extractAllMatches;
