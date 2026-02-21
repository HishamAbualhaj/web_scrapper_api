import extractProductFromBox from "./extractProductFromBox.js";
import extractStoreData from "./extractStoreData.js";

function extractAllProducts(html: string, url: string): ProductDetails[] {
  const products: ProductDetails[] = [];

  console.log("\n🔍 Searching for product grid...");

  // Find the grid container with data-qa="plp-grid"
  const gridPattern =
    /<div[^>]*data-qa="plp-grid"[^>]*>([\s\S]*?)(?=<div class="PlpPagination|<button class="ScrollTopButton|<div class="FooterDesktop|$)/;
  const gridMatch = html.match(gridPattern);

  if (!gridMatch) {
    console.log('❌ Could not find product grid with data-qa="plp-grid"');
    return products;
  }

  const gridHtml = gridMatch[1];
  console.log(
    `✅ Found product grid (${Math.round(gridHtml.length / 1024)}KB)`,
  );

  // Extract all product boxes - match from opening div to closing </a></div>
  const productBoxPattern =
    /<div class="PBoxLinkHandler[^"]*__linkWrapper"[^>]*data-qa="plp-product-box">([\s\S]*?)<\/a><\/div>/g;

  const productBoxes: string[] = [];
  let match;

  while ((match = productBoxPattern.exec(gridHtml)) !== null) {
    // Include the wrapper div and closing tags for complete structure
    const completeBox = match[0];
    productBoxes.push(completeBox);
  }

  console.log(`📦 Found ${productBoxes.length} product boxes`);

  // Process each product box
  productBoxes.forEach((productBox, index) => {
    const isDebug = index === 0 || index === productBoxes.length - 1;

    if (isDebug) {
      console.log(`\n🔍 Product ${index + 1}/${productBoxes.length}:`);
      console.log(`   HTML length: ${productBox.length} chars`);
    }

    const [storeId, storeName] = extractStoreData(url, html);

    const product = extractProductFromBox(productBox);

    if (product) {
      if (product.productId && product.title) {
        products.push({
          ...product,
          storeId: storeId || "",
          storeName: storeName || "",
        });

        if (isDebug) {
          console.log(`   ✅ Successfully extracted`);
          console.log(`      ID: ${product.productId}`);
          console.log(`      URL: ${product.productUrl}`);
          console.log(`      Images: ${product.images.length}`);
        }
      } else {
        console.log(`\n⚠️  Product ${index + 1} incomplete:`);
        console.log(`    ID: ${product.productId || "MISSING"}`);
        console.log(
          `    Title: ${product.title ? product.title.substring(0, 40) + "..." : "MISSING"}`,
        );
      }
    } else if (isDebug) {
      console.log("   ❌ Extraction returned null");
    }
  });

  console.log(`\n✅ Extracted ${products.length} valid products from grid\n`);

  return products;
}

export default extractAllProducts;
