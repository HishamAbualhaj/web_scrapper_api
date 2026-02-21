import extractSingleProduct from "../helpers/extractSingleProduct.js";
import fetchPage from "../helpers/fetchPageHttp.js";

export async function scrapeSingleProduct(
  productId: string
): Promise<SingleProduct | null> {
  const url = `https://www.noon.com/saudi-ar/${productId}/p`;

  console.log(`\n📦 Fetching product: ${productId}`);
  console.log(`🔗 URL: ${url}`);

  const html = await fetchPage(url);
  console.log(`✓ Page fetched (${Math.round(html.length / 1024)}KB)`);

  const product = extractSingleProduct(html, productId);

  if (!product) {
    console.log("⚠ Product data not found");
    return null;
  }

  console.log("✅ Product extracted successfully");
  return product;
}
export default scrapeSingleProduct;
