import http, { IncomingMessage, ServerResponse } from "http";
import scrapeSingleProduct from "./scrapers/scrapeSingleProduct.js";
import scrapeStoreProducts from "./scrapers/scrapeStoreProducts.js";
const server = http.createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    let body = "";

    req.on("data", (chunks: Buffer) => {
      body += chunks.toString();
    });
    req.on("end", async () => {
      if (req.url === "/scrapeSingleProduct" && req.method === "POST") {
        const parsedBody: { productId: string } = JSON.parse(body);

        const { productId } = parsedBody;
        if (!productId) {
          res.statusCode = 400;
          res.end(
            JSON.stringify({
              message: "productId is required",
            }),
          );
          return;
        }
        try {
          const data = await scrapeSingleProduct(productId);
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, data }));
        } catch (error) {
          console.error("Error", (error as Error).message);
          res.writeHead(500);
          res.end(
            JSON.stringify({
              success: false,
              error: "Something went wrong, contact developer",
            }),
          );
        }
        return;
      }

      if (req.url === "/scrapeStoreProducts" && req.method === "POST") {
        const { storeUrl, storeName } = JSON.parse(body);

        if (!storeUrl) {
          res.statusCode = 400;
          res.end(
            JSON.stringify({
              message: "storeUrl is required",
            }),
          );
          return;
        }
        try {
          const data = await scrapeStoreProducts(storeUrl);
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, data }));
        } catch (error) {
          console.error("Error", (error as Error).message);
          res.writeHead(500);
          res.end(
            JSON.stringify({
              success: false,
              error: "Something went wrong, contact developer",
            }),
          );
        }
        return;
      }

      res.writeHead(404);
      res.end(JSON.stringify({ message: "Not Found" }));
    });
  },
);

export default server;
