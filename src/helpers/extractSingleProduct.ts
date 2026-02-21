import cleanText from "./cleanText.js";
import extractNudges from "./extractNudges.js";
import extractSingleProductImages from "./extractSingleProductImages.js";
import extractText from "./extractText.js";

function extractSingleProduct(
  html: string,
  productId: string
): SingleProduct | null {
  try {
    // Title
    const titlePattern =
      /<span class="ProductTitle-module-scss-module__EXiEUa__title">([^<]*)<\/span>/;
    const title = extractText(html, titlePattern);

    if (!title) return null;

    // Price (current)
    const pricePattern =
      /<span class="PriceOfferV2-module-scss-module__dHtRPW__priceNowText">([^<]*)<\/span>/;
    const price = extractText(html, pricePattern);

    // Old price
    const oldPricePattern =
      /<div class="PriceOfferV2-module-scss-module__dHtRPW__priceWasText">[\s\S]*?<span>\s*([^<]*)<\/span>/;
    const oldPrice = extractText(html, oldPricePattern);

    // ✅ Rating
    const ratingPattern =
      /<span class="RatingPreviewStarV2-module-scss-module__[^"]*__text">([^<]*)<\/span>/;
    const rating = extractText(html, ratingPattern);

    // Review count

    const reviewCountPattern =
      /<span class="RatingPreviewStarV2-module-scss-module__0_8vQW__countText">(\d+)/;

    const reviewCount = extractText(html, reviewCountPattern);

    // ✅ Nudges
    const nudges = extractNudges(html);

    const texts = new Set<string>();

    nudges.forEach((n) => {
      if (n.text) texts.add(n.text);
    });

    // Discount calculation
    let discount: string | undefined;
    if (price && oldPrice) {
      const priceNum = parseFloat(price);
      const oldNum = parseFloat(oldPrice);
      if (!isNaN(priceNum) && !isNaN(oldNum) && oldNum > priceNum) {
        discount = `${Math.round(((oldNum - priceNum) / oldNum) * 100)}%`;
      }
    }

    const arrOfImages = extractSingleProductImages(html);
    return {
      productId,
      title: cleanText(title),
      price: price || "N/A",
      oldPrice: oldPrice || "",
      discount: discount || "",
      rating: rating || "",
      reviewCount: reviewCount || "",
      nudges: Array.from(texts),
      productUrl: `https://www.noon.com/saudi-ar/${productId}/p`,
      images: arrOfImages,
    };
  } catch (err) {
    console.error("Error extracting single product:", err);
    return null;
  }
}
export default extractSingleProduct;
