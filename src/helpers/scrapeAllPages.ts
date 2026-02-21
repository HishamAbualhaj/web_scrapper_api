import buildUrlWithPage from "./buildUrlWithPage.js";
import delay from "./delay.js";
import scrapeProducts from "./scrapeProducts.js";
async function scrapeAllPages(
  options: PaginationOptions
): Promise<ProductDetails[]> {
  const {
    url,
    startPage = 1,
    maxPages = 100,
    stopOnEmpty = true,
    maxRetries = 3,
    retryDelay = 2000,
  } = options;

  const allProducts: ProductDetails[] = [];
  let currentPage = startPage;
  let consecutiveEmptyPages = 0;
  const MAX_CONSECUTIVE_EMPTY = 1; // Stop after 1 consecutive empty pages

  console.log("\n" + "=".repeat(70));
  console.log("🚀 STARTING PAGINATION SCRAPING");
  console.log("=".repeat(70));
  console.log(`📍 Base URL: ${url}`);
  console.log(`📄 Starting from page: ${startPage}`);
  console.log(`🔢 Max pages: ${maxPages}`);
  console.log("=".repeat(70));

  while (currentPage <= maxPages) {
    try {
      const pageUrl = buildUrlWithPage(url, currentPage);

      console.log(`\n${"─".repeat(70)}`);
      console.log(`📄 Scraping Page ${currentPage}...`);
      console.log(`${"─".repeat(70)}`);

      const products = await scrapeProducts({
        url: pageUrl,
        maxRetries,
        retryDelay,
      });

      if (products.length === 0) {
        consecutiveEmptyPages++;
        console.log(`Found Empty pages`);

        if (stopOnEmpty && consecutiveEmptyPages >= MAX_CONSECUTIVE_EMPTY) {
          console.log(
            `\n🛑 Stopping: Found ${MAX_CONSECUTIVE_EMPTY} consecutive empty pages`
          );
          break;
        }
      } else {
        consecutiveEmptyPages = 0; // Reset counter when we find products
        allProducts.push(...products);
        console.log(
          `✅ Added ${products.length} products from page ${currentPage}`
        );
        console.log(`📊 Total products so far: ${allProducts.length}`);
      }

      currentPage++;

      // Add delay between pages to be polite
      if (
        currentPage <= maxPages &&
        !(stopOnEmpty && consecutiveEmptyPages >= MAX_CONSECUTIVE_EMPTY)
      ) {
        const pageDelay = 500;
        console.log(
          `⏳ Waiting ${Math.round(pageDelay / 1000)}s before next page...`
        );
        await delay(pageDelay);
      }
    } catch (error) {
      console.error(`❌ Error on page ${currentPage}:`, error);
      consecutiveEmptyPages++;

      if (consecutiveEmptyPages >= MAX_CONSECUTIVE_EMPTY) {
        console.log(
          `\n🛑 Stopping after ${MAX_CONSECUTIVE_EMPTY} consecutive failures`
        );
        break;
      }

      currentPage++;
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("✨ PAGINATION COMPLETE");
  console.log("=".repeat(70));
  console.log(`📊 Total pages scraped: ${currentPage - startPage}`);
  console.log(`📦 Total products found: ${allProducts.length}`);
  console.log("=".repeat(70) + "\n");

  return allProducts;
}

export default scrapeAllPages;
