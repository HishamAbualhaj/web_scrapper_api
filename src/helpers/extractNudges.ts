import cleanText from "./cleanText.js";

function extractNudges(html: string): ProductNudge[] {
  const nudges: ProductNudge[] = [];

  const nudgePattern =
    /<div class="Nudges-module-scss-module__[^"]*__nudge">[\s\S]*?<img[^>]*src="([^"]*)"[\s\S]*?<div class="Nudges-module-scss-module__[^"]*__nudgeText[^"]*">([^<]*)<\/div>/g;

  let match;
  while ((match = nudgePattern.exec(html)) !== null) {
    nudges.push({
      icon: match[1],
      text: cleanText(match[2]),
    });
  }

  return nudges;
}
export default extractNudges;
