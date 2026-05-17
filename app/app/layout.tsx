import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const serif = Noto_Serif_SC({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "同舟 · 轻量化课程交付 SaaS",
  description: "让每一个创作者，都能拥有自己的成长型 SaaS 产品。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={`${sans.variable} ${mono.variable} ${serif.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
