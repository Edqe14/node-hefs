export default function buildCookies(cookies: Record<string, string>): string {
  return Object.keys(cookies)
    .map((k) => {
      if (cookies[k] === undefined || cookies[k] === null) return null;
      return `${k}=${cookies[k]}`;
    })
    .filter((v) => v !== null)
    .join('; ');
}
