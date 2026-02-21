function buildUrlWithPage(baseUrl: string, page: number): string {
  const url = new URL(baseUrl);
  url.searchParams.set("page", page.toString());
  return url.toString();
}

export default buildUrlWithPage;
