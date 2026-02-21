import extractText from "./extractText.js";

function extractStoreData(link: string, html: string): (string | null)[] {
  const storeNameRegex = /<title>(.*?)<\/title>/i;
  const storeFullName = extractText(html, storeNameRegex);

  const storeName = extractText(storeFullName || "", /^(.*?)\s*\|/);

  const storeIdRegex = /\/(p-\d+)\//;

  const storeId = extractText(link, storeIdRegex);

  return [storeId, storeName];
}

export default extractStoreData;
