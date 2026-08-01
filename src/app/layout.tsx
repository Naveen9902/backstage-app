import type { Metadata } from "next";
import "./globals.css";
import CapacitorAppLogic from "@/components/CapacitorAppLogic";
import FlavorSetter from "@/components/FlavorSetter";
import { Suspense } from "react";
import Script from "next/script";

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
      className={`h-full antialiased`}
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
        <script dangerouslySetInnerHTML={{ __html: `
              const originalFetch = window.fetch;
              window.fetch = function() {
                let args = Array.from(arguments);
                const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
                const isCloudinary = url.includes('api.cloudinary.com');
                
                const token = localStorage.getItem('sessionToken');
                if (token && !isCloudinary) {
                  args[1] = args[1] || {};
                  
                  // Handle case where headers is a Headers instance vs plain object
                  if (args[1].headers instanceof Headers) {
                    args[1].headers.set('Authorization', 'Bearer ' + token);
                  } else {
                    args[1].headers = args[1].headers || {};
                    args[1].headers['Authorization'] = 'Bearer ' + token;
                  }
                }
                if (args[1] && !isCloudinary) {
                  args[1].credentials = args[1].credentials || 'include';
                }
                return originalFetch.apply(this, args);
              };
 `}} />
        <CapacitorAppLogic />
        <Suspense fallback={null}>
          <FlavorSetter />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
