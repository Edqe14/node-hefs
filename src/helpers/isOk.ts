export default function isOk(code: number): boolean {
  return code >= 200 && code <= 299;
}
