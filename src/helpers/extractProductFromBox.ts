import cleanText from "./cleanText.js";
import extractAllMatches from "./extractAllMatches.js";
import extractText from "./extractText.js";
function extractProductFromBox(productBox: string): ProductDetails | null {
  try {
    // Extract Product URL from <a> tag inside data-qa="plp-product-box"
    let productId = "";
    let productUrl = "";

    const hrefPattern =
      /<a class="PBoxLinkHandler[^"]*productBoxLink" href="([^"]*)"/;
    const hrefMatch = productBox.match(hrefPattern);

    if (hrefMatch) {
      const productUrlPath = hrefMatch[1];

      // Extract product ID from URL (format: /N70161558V/)
      const idPattern = /\/(N\d+[A-Z]+)\//;
      const idMatch = productUrlPath.match(idPattern);

      if (idMatch) {
        productId = idMatch[1];
      }

      // Build complete URL
      productUrl = productUrlPath.startsWith("http")
        ? productUrlPath
        : `https://www.noon.com${productUrlPath}`;
    }

    // Fallback: Extract product ID from image URLs if href fails
    if (!productId) {
      const imageIdPattern =
        /https:\/\/f\.nooncdn\.com\/p\/pnsku\/(N\d+[A-Z]+)\//;
      const imageIdMatch = productBox.match(imageIdPattern);

      if (imageIdMatch) {
        productId = imageIdMatch[1];
        productUrl = `https://www.noon.com/saudi-ar/product/${productId}/p/`;
      }
    }

    // Extract title
    const titlePattern = /data-qa="plp-product-box-name"[^>]*title="([^"]*)"/;
    const title = extractText(productBox, titlePattern);

    if (!title) {
      return null;
    }

    // Extract price
    const pricePattern = /<strong class="[^"]*amount[^"]*">([^<]+)<\/strong>/;
    const price = extractText(productBox, pricePattern);

    // Extract original price
    const originalPricePattern =
      /<span class="[^"]*oldPrice[^"]*">([^<]+)<\/span>/;
    const originalPrice = extractText(productBox, originalPricePattern);

    // Calculate discount
    let discount = null;
    if (price && originalPrice) {
      const priceNum = parseFloat(price.replace(/,/g, ""));
      const originalNum = parseFloat(originalPrice.replace(/,/g, ""));
      if (!isNaN(priceNum) && !isNaN(originalNum) && originalNum > priceNum) {
        discount = `${Math.round(
          ((originalNum - priceNum) / originalNum) * 100,
        )}%`;
      }
    }

    // Extract rating
    const ratingPattern = /class="[^"]*__textCtr">([0-9.]+)<\/div>/;
    const rating = extractText(productBox, ratingPattern);

    // Extract review count
    const reviewCountPattern = /countCtr[^"]*">[\s\S]*?<span>([^<]+)<\/span>/;
    const reviewCount = extractText(productBox, reviewCountPattern);

    // Extract images - support both formats
    const images: string[] = [];

    // Pattern 1: New format (pnsku)
    const imagePattern1 =
      /<img[^>]+src="(https:\/\/f\.nooncdn\.com\/p\/pnsku\/[^"]+\.jpg[^"]*)"/g;
    let imgMatch;
    while ((imgMatch = imagePattern1.exec(productBox)) !== null) {
      if (!images.includes(imgMatch[1])) {
        images.push(imgMatch[1]);
      }
    }

    // Pattern 2: Old format
    if (images.length === 0) {
      const imagePattern2 =
        /<img[^>]+src="(https:\/\/f\.nooncdn\.com\/p\/v\d+\/N\d+[A-Z]+_\d+\.jpg[^"]*)"/g;
      while ((imgMatch = imagePattern2.exec(productBox)) !== null) {
        if (!images.includes(imgMatch[1])) {
          images.push(imgMatch[1]);
        }
      }
    }

    // Pattern 3: Any noon product image (excluding icons)
    if (images.length === 0) {
      const imagePattern3 =
        /<img[^>]+src="(https:\/\/f\.nooncdn\.com\/p\/[^"]+\.jpg[^"]*)"/g;
      while ((imgMatch = imagePattern3.exec(productBox)) !== null) {
        const url = imgMatch[1];
        if (!url.includes("/icons/") && !url.includes("/noon/images/")) {
          if (!images.includes(url)) {
            images.push(url);
          }
        }
      }
    }

    // Extract badge
    const badgePattern =
      /<span class="[^"]*BestSellerTag[^"]*text[^"]*">([^<]+)<\/span>/;
    const badge = extractText(productBox, badgePattern);

    // Extract nudges
    const nudgePattern = /<div class="[^"]*nudgeText[^"]*">([^<]+)<\/div>/g;
    const nudges = extractAllMatches(productBox, nudgePattern).filter(
      (nudge, index, self) => self.indexOf(nudge) === index,
    );

    // Extract stock info
    const stockInfo =
      nudges.find(
        (nudge) => nudge.includes("المخزون") || nudge.includes("وحد"),
      ) || "";

    return {
      storeId: "",
      storeName: "",
      productId: productId,
      title: cleanText(title),
      price: price || "N/A",
      originalPrice: originalPrice || "",
      discount: discount || "",
      rating: rating || "",
      reviewCount: reviewCount || "",
      images: images,
      productUrl: productUrl,
      badge: badge || "",
      nudges: nudges,
      stockInfo: stockInfo,
    };
  } catch (error) {
    console.error("Error extracting product from box:", error);
    return null;
  }
}
export default extractProductFromBox;
