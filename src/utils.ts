export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(date: Date, lang: 'vi' | 'en'): string {
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
