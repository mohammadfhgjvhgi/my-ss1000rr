import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "إيدو تراك - نظام إدارة الشؤون الأكاديمية",
  description: "مساعد إدارة الشؤون الطلابية الشخصي الذي يساعد الطلاب على إدارة المواد والواجبات والاختبارات وتتبع التقدم الأكاديمي",
  keywords: ["إيدو تراك", "طالب", "تعليم", "إدارة المواد", "أكاديمي"],
  authors: [{ name: "إيدو تراك" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
