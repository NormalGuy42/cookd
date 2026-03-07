import type { Metadata } from "next";
import { Fredoka, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { links } from "@/constants";

// Playful display font for headings
const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Warm, readable body font
const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Mono font for code
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const siteUrl = "https://cookd.fun";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cookd - Where Great Ideas Get Cooked",
    template: "%s | Cookd",
  },
  description: "Cookd is a platform celebrating human creativity and ingenuity. Submit your idea, and we'll bring it to life—beautifully crafted and served fresh.",
  keywords: [
    "app development",
    "creative ideas",
    "web apps",
    "custom development",
    "project showcase",
    "Hall of Fame",
    "idea to reality",
    "build my app",
  ],
  authors: [{ name: "Madiou", url: links["twitter"] }],
  creator: "Madiou",
  publisher: "Cookd",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Cookd",
    title: "Cookd - Where Great Ideas Get Cooked",
    description: "A platform celebrating human creativity and ingenuity. Submit your idea, and we'll bring it to life.",
    images: [
      {
        url: "/og-images/main-og-image.png",
        width: 1200,
        height: 630,
        alt: "Cookd - Where Great Ideas Get Cooked",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cookd - Where Great Ideas Get Cooked",
    description: "A platform celebrating human creativity and ingenuity. Submit your idea, and we'll bring it to life.",
    images: ["/og-images/main-og-image.png"],
    creator: links["twitter_username"],
  },
  icons: {
    icon: "/cookd-logo.png",
    apple: "/cookd-logo.png",
  },
  manifest: "/manifest.json",
};

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Cookd",
  url: siteUrl,
  description: "A platform celebrating human creativity and ingenuity. Submit your idea, and we'll bring it to life.",
  publisher: {
    "@type": "Organization",
    name: "Cookd",
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/cookd-logo.png`,
    },
  },
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/projects?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${fredoka.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
