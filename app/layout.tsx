import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "eCours — منصة إدارة الدروس الخصوصية",
  description:
    "منصة ذكية لإدارة الأفواج، تتبع الحضور، والتحصيل المالي للدروس الخصوصية",
  icons: {
    icon: [
      { url: "/images/logo-transparent.png", type: "image/png" },
    ],
    shortcut: "/images/logo-transparent.png",
    apple: "/images/logo-transparent.png",
  },
};

import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { AuthProvider } from "@/lib/AdminContext";
import { ThemeProvider } from "@/lib/ThemeContext";

import { Cairo } from "next/font/google";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
});

import { QueryProvider } from "@/components/providers/query-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${cairo.variable} scroll-smooth`}>
      <body suppressHydrationWarning className={`${cairo.className} font-sans`}>
        <QueryProvider>
          <ThemeProvider>
            <LanguageProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
