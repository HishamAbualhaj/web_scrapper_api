export default function extractSingleProductImages(html: string): string[] {
  // 1️⃣ Match the gallery slider container
  const containerMatch = html.match(
    /<div class="GalleryV2-module-scss-module__hlK6zG__sliderInnerCtr"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/
  );

  if (!containerMatch) return [];

  const containerHtml = containerMatch[0];

  // 2️⃣ Extract all CDN images inside the container
  const imgRegex =
    /<img[^>]+src="(https:\/\/f\.nooncdn\.com\/p\/[^"]+)"[^>]*>/g;

  const images = new Set<string>();
  let match;

  while ((match = imgRegex.exec(containerHtml)) !== null) {
    images.add(match[1]);
  }

  return Array.from(images);
}
