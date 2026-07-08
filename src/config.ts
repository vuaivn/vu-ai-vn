export const site = {
  name: 'Vũ AI',
  domain: 'vu.ai.vn',
  url: 'https://vu.ai.vn',
  email: 'support@vu.ai.vn',
  calendly: '', // chưa có
  social: {
    facebook: 'https://www.facebook.com/vu.ai.vn',
    youtube: 'https://www.youtube.com/@vuaivn',
    github: 'https://github.com/vuaivn',
    x: 'https://x.com/vuaivn',
  },
};

export const categories = {
  vi: [
    { slug: 'phat-trien-ban-than', name: 'Phát triển bản thân' },
    { slug: 'cong-nghe', name: 'Công nghệ thông tin' },
    { slug: 'review', name: 'Review dự án' },
  ],
  en: [
    { slug: 'phat-trien-ban-than', name: 'Self-growth' },
    { slug: 'cong-nghe', name: 'Technology' },
    { slug: 'review', name: 'Project reviews' },
  ],
};

export const tools = [
  {
    name: { vi: 'Main Agent', en: 'Main Agent' },
    desc: {
      vi: 'Trợ lý AI điều phối toàn bộ công việc: thiết kế hệ thống, code, nghiên cứu, sáng tạo nội dung.',
      en: 'AI assistant orchestrating all work: system design, coding, research, content creation.',
    },
    tags: ['AI', 'Automation'],
    link: '',
  },
  {
    name: { vi: 'Skill Builder', en: 'Skill Builder' },
    desc: {
      vi: 'Bộ công cụ tạo và quản lý các skill AI theo chuẩn AgentSkills.',
      en: 'Toolkit to create and manage AI skills following the AgentSkills spec.',
    },
    tags: ['AI', 'Skill'],
    link: '',
  },
];

export const projects = [
  {
    name: { vi: 'Website vu.ai.vn', en: 'vu.ai.vn Website' },
    desc: {
      vi: 'Website cá nhân song ngữ, xây bằng Astro, deploy trên Cloudflare Pages.',
      en: 'Bilingual personal website, built with Astro, deployed on Cloudflare Pages.',
    },
    tags: ['Astro', 'Web', 'SEO'],
    link: 'https://vu.ai.vn',
  },
  {
    name: { vi: 'Kênh YouTube Vũ AI', en: 'Vu AI YouTube Channel' },
    desc: {
      vi: 'Nội dung về công nghệ, AI và phát triển bản thân.',
      en: 'Content about technology, AI and self-growth.',
    },
    tags: ['Content', 'YouTube'],
    link: 'https://www.youtube.com/@vuaivn',
  },
];
