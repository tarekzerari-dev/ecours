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

import { Readex_Pro, Kufam, Beiruti, Space_Grotesk, DM_Sans } from "next/font/google";

// 1. Primary Arabic body font — clear, modern, excellent readability
const readexPro = Readex_Pro({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-readex",
  display: "swap",
});

// 2. Arabic heading font — bold, distinctive geometric Kufic structure
const kufam = Kufam({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-kufam",
  display: "swap",
});

// 3. Arabic personality & accent font — authentic calligraphic character
const beiruti = Beiruti({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-beiruti",
  display: "swap",
});

// 4. Latin heading & brand font — tech-forward geometric character
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

// 5. Latin body font — clean, professional, high legibility
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

import { QueryProvider } from "@/components/providers/query-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${readexPro.variable} ${kufam.variable} ${beiruti.variable} ${spaceGrotesk.variable} ${dmSans.variable} scroll-smooth`}
    >
      <body suppressHydrationWarning className={`${readexPro.className} font-sans`}>
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
