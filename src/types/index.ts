interface ProductDetails {
  storeId: string;
  storeName: string;
  productId: string;
  title: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  rating?: string;
  reviewCount?: string;
  images: string[];
  productUrl?: string;
  badge?: string;
  nudges: string[];
  stockInfo?: string;
}
interface ProductNudge {
  text: string;
  icon: string;
}
interface SingleProduct {
  productId: string;
  title: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  rating?: string;
  reviewCount?: string;
  nudges: string[];
  productUrl: string;
  images: string[];
}
interface ScraperOptions {
  url: string;
  maxRetries?: number;
  retryDelay?: number;
}

interface PaginationOptions extends ScraperOptions {
  startPage?: number;
  maxPages?: number;
  stopOnEmpty?: boolean;
}
