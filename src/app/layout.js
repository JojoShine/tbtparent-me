import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 在 React hydrate 前同步设置主题和语言，避免闪烁
const initScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      // 默认暗黑模式：只有明确设置为 light 才不加 dark class
      if (!theme || theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
      var lang = localStorage.getItem('lang');
      if (!lang) {
        var browserLang = navigator.language || (navigator.languages && navigator.languages[0]) || 'zh';
        lang = browserLang.indexOf('zh') === 0 ? 'zh' : 'en';
      }
      document.documentElement.lang = lang;
    } catch(e) {}
  })();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = 'https://tbtparent.me'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '甜宝塔家长 | tbtparent',
    template: '%s | 甜宝塔家长',
  },
  description: '极简黑白个人站 - 技术博客、开源项目、在线工具、小游戏。涵盖运维、开发、AI、数据等领域。',
  keywords: ['tbtparent', '甜宝塔家长', '个人博客', '技术博客', '运维', '开发', 'AI', '在线工具', '小游戏'],
  authors: [{ name: 'tbtparent', url: SITE_URL }],
  creator: 'tbtparent',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: SITE_URL,
    siteName: '甜宝塔家长',
    title: '甜宝塔家长 | tbtparent',
    description: '极简黑白个人站 - 技术博客、开源项目、在线工具、小游戏',
    images: [{ url: '/assets/logo.jpg', width: 512, height: 512, alt: '甜宝塔家长' }],
  },
  twitter: {
    card: 'summary',
    title: '甜宝塔家长 | tbtparent',
    description: '极简黑白个人站 - 技术博客、开源项目、在线工具、小游戏',
    images: ['/assets/logo.jpg'],
  },
  icons: {
    icon: '/assets/logo.jpg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="zh"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: initScript }} />
      </head>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: '甜宝塔家长',
              alternateName: 'tbtparent',
              url: SITE_URL,
              description: '极简黑白个人站 - 技术博客、开源项目、在线工具、小游戏',
              author: { '@type': 'Person', name: 'tbtparent', url: SITE_URL },
              potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE_URL}/?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
