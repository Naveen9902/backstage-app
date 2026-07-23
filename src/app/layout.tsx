import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Back Stage',
    default: 'Back Stage - The Ultimate Event Staffing Platform',
  },
  description: "Connecting world-class talent with premier event managers. Book staff, manage events, and handle payouts all in one place.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BackStage",
  },
  openGraph: {
    title: 'Back Stage - Event Staffing',
    description: 'Connecting world-class talent with premier event managers.',
    url: 'https://backstage-app.vercel.app', // Update with actual URL when deploying
    siteName: 'Back Stage',
    images: [
      {
        url: '/logo.png', // Ideally a dedicated OG image
        width: 800,
        height: 600,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Back Stage - Event Staffing',
    description: 'Connecting world-class talent with premier event managers.',
    images: ['/logo.png'],
  },
};

export const viewport = {
  themeColor: "#CD7F32",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning={true}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
