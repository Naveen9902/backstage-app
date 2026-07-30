import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CapacitorAppLogic from "@/components/CapacitorAppLogic";
import FlavorSetter from "@/components/FlavorSetter";
import { Suspense } from "react";
import Script from "next/script";

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
        url: '/logo.jpg', // Ideally a dedicated OG image
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
    images: ['/logo.jpg'],
  },
};

export const viewport = {
  themeColor: "#CD7F32",
  viewportFit: "cover",
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
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                  }
                });
              }
            `,
          }}
        />
        <script dangerouslySetInnerHTML={{ __html: 
              const originalFetch = window.fetch;
              window.fetch = function() {
                let args = arguments;
                if (args[1]) {
                  args[1].credentials = args[1].credentials || 'include';
                } else {
                  args[1] = { credentials: 'include' };
                }
                return originalFetch.apply(this, args);
              };
 }} />
        <CapacitorAppLogic />
        <Suspense fallback={null}>
          <FlavorSetter />
        </Suspense>
        {children}
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
