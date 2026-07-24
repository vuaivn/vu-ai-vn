export const languages = { vi: 'Tiếng Việt', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'vi';

export const ui = {
  vi: {
    'nav.home': 'Trang chủ',
    'nav.blog': 'Blog',
    'nav.tools': 'Tool & Skill',
    'nav.contact': 'Liên hệ',
    'hero.tagline': 'Đam mê công nghệ · Yêu tự do · Tạo giá trị thật',
    'hero.intro':
      'Vũ AI — người đam mê công nghệ, thích làm việc với máy tính và yêu sự tự do. Mục đích sống: tạo ra giá trị thật cho mọi người bằng chính đam mê của mình, và xây dựng thu nhập bền vững trên internet.',
    'hero.cta': 'Liên hệ với tôi',
    'home.explore': 'Khám phá',
    'home.latest': 'Bài viết mới nhất',
    'home.viewAll': 'Xem tất cả',
    'blog.title': 'Blog',
    'blog.subtitle': 'Phát triển bản thân · Công nghệ · Review dự án',
    'blog.readingTime': 'phút đọc',
    'blog.all': 'Tất cả',
    'tools.title': 'Tool & Skill',
    'tools.subtitle': 'Công cụ, skill AI và các dự án tôi đã xây dựng',
    'tools.skillsHead': 'Tools & Skills',
    'tools.projectsHead': 'Dự án / Portfolio',
    'tools.visit': 'Xem',
    'contact.title': 'Liên hệ',
    'contact.subtitle': 'Kết nối với tôi qua các kênh dưới đây',
    'contact.email': 'Email',
    'contact.social': 'Mạng xã hội',
    'contact.book': 'Đặt lịch hẹn',
    'contact.bookSoon': 'Tính năng đặt lịch sẽ sớm ra mắt.',
    'footer.rights': 'Bản quyền thuộc về Vũ AI.',
    'footer.built': 'Xây bằng Astro, deploy trên Cloudflare.',
  },
  en: {
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.tools': 'Tool & Skill',
    'nav.contact': 'Contact',
    'hero.tagline': 'Passion for tech · Love for freedom · Real value',
    'hero.intro':
      'Vu AI — a technology enthusiast who loves working with computers and values freedom. My purpose: to create real value for people through my passion, and build sustainable income on the internet.',
    'hero.cta': 'Get in touch',
    'home.explore': 'Explore',
    'home.latest': 'Latest posts',
    'home.viewAll': 'View all',
    'blog.title': 'Blog',
    'blog.subtitle': 'Self-growth · Technology · Project reviews',
    'blog.readingTime': 'min read',
    'blog.all': 'All',
    'tools.title': 'Tool & Skill',
    'tools.subtitle': 'AI tools, skills and projects I have built',
    'tools.skillsHead': 'Tools & Skills',
    'tools.projectsHead': 'Projects / Portfolio',
    'tools.visit': 'Visit',
    'contact.title': 'Contact',
    'contact.subtitle': 'Connect with me through the channels below',
    'contact.email': 'Email',
    'contact.social': 'Social',
    'contact.book': 'Book a call',
    'contact.bookSoon': 'Booking feature coming soon.',
    'footer.rights': 'All rights reserved by Vu AI.',
    'footer.built': 'Built with Astro, deployed on Cloudflare.',
  },
} as const;

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)['vi']): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

export function getLangFromUrl(url: URL): Lang {
  const [, seg] = url.pathname.split('/');
  if (seg === 'en') return 'en';
  return 'vi';
}

// Build a path for the given lang, preserving the sub-path after locale.
export function localizedPath(path: string, lang: Lang): string {
  const clean = path.replace(/^\/(en|vi)/, '') || '/';
  if (lang === 'en') return '/en' + (clean === '/' ? '' : clean);
  return clean;
}
