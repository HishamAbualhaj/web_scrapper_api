import https from "https";
import http from "http";
import { URL } from "url";
import zlib from "zlib";
import { Readable } from "stream";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function fetchPage(
  url: string,
  redirectCount: number = 0,
): Promise<string> {
  const MAX_REDIRECTS = 5;

  if (redirectCount >= MAX_REDIRECTS) {
    throw new Error("Too many redirects");
  }

  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === "https:";
    const client = isHttps ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: "GET",
      headers: {
        "User-Agent": getRandomUserAgent(),
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "ar,en-US;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        DNT: "1",
        "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
      },
    };

    const req = client.request(options, (res) => {
      // Handle all redirect status codes
      if (
        res.statusCode === 301 ||
        res.statusCode === 302 ||
        res.statusCode === 307 ||
        res.statusCode === 308
      ) {
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          console.log(`↪ Redirecting to: ${redirectUrl}`);
          // Handle relative URLs
          const newUrl = redirectUrl.startsWith("http")
            ? redirectUrl
            : `${parsedUrl.protocol}//${parsedUrl.hostname}${redirectUrl}`;
          fetchPage(newUrl, redirectCount + 1)
            .then(resolve)
            .catch(reject);
          return;
        }
      }

      let data = "";

      // Handle compression
      let stream: Readable = res;
      const encoding = res.headers["content-encoding"];

      if (encoding === "gzip") {
        stream = res.pipe(zlib.createGunzip());
      } else if (encoding === "deflate") {
        stream = res.pipe(zlib.createInflate());
      } else if (encoding === "br") {
        stream = res.pipe(zlib.createBrotliDecompress());
      }

      stream.on("data", (chunk: Buffer) => {
        data += chunk.toString("utf8");
      });

      stream.on("end", () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else if (res.statusCode === 404) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });

      stream.on("error", reject);
    });

    req.on("error", reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.end();
  });
}

export default fetchPage;
