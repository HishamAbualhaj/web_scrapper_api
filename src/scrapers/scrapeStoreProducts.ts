import scrapeAllPages from "../helpers/scrapeAllPages.js";

export default async function scrapeStoreProducts(url: string) {
  let products: ProductDetails[] = [];

  try {
    products = await scrapeAllPages({
      url,
      maxRetries: 3,
      retryDelay: 1000,
    });

    return products;
  } catch (error) {
    console.error(`\n❌ Error scraping ${url}:`, error);
  }

  return products;
}
