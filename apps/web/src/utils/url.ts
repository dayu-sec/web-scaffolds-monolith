const EXTERNAL_URL_PATTERN = /^https?:\/\//i;

export function isExternalUrl(input: string): boolean {
  return EXTERNAL_URL_PATTERN.test(input);
}
