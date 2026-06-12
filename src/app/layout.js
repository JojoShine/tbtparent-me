import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 在 React hydrate 前同步设置主题和语言，避免闪烁
const initScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      if (theme === 'dark') {
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

export const metadata = {
  title: "甜宝塔家长",
  description: "极简黑白 · 全局微动画 · 数字宠物小猫",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: initScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
