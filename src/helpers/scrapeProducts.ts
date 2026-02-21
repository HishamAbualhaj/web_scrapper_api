import fetchPage from "./fetchPageHttp.js";
import delay from "./delay.js";
import extractAllProducts from "./extractAllProducts.js";

async function scrapeProducts(
  options: ScraperOptions
): Promise<ProductDetails[]> {
  const { url, maxRetries = 3, retryDelay = 2000 } = options;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`\n[Attempt ${attempt}/${maxRetries}] Fetching: ${url}`);

      if (attempt > 1) {
        const waitTime = retryDelay + Math.random() * 1000;
        console.log(`⏳ Waiting ${Math.round(waitTime)}ms before retry...`);
        await delay(waitTime);
      }

      const html = await fetchPage(url);

      console.log(
        `✓ Page fetched successfully (${Math.round(html.length / 1024)}KB)`
      );

      const products = extractAllProducts(html, url);

      if (products.length > 0) {
        console.log(`✓ Extracted ${products.length} products`);
        return products;
      } else {
        console.log("⚠ No products found in the page");
        return [];
      }
    } catch (error) {
      lastError = error as Error;
      console.error(
        `✗ Attempt ${attempt} failed:`,
        error instanceof Error ? error.message : error
      );

      if (attempt === maxRetries) {
        throw new Error(
          `Failed after ${maxRetries} attempts: ${lastError.message}`
        );
      }
    }
  }

  throw lastError || new Error("Unknown error occurred");
}

export default scrapeProducts;
