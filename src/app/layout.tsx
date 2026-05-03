import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Kool Tech Solutions — Enterprise IT & MSP Services",
    template: "%s | Kool Tech Solutions",
  },
  description:
    "Enterprise-grade Managed IT Services for the Dominican Republic, USA, Canada & Caribbean. Cybersecurity, Cloud, Network Management & 24/7 Support.",
  keywords: [
    "MSP",
    "managed service provider",
    "IT services",
    "cybersecurity",
    "cloud services",
    "Dominican Republic",
    "Caribbean IT",
  ],
  authors: [{ name: "Kool Tech Solutions" }],
  creator: "Kool Tech Solutions",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kooltech.solutions",
    siteName: "Kool Tech Solutions",
    title: "Kool Tech Solutions — Enterprise IT & MSP Services",
    description:
      "Enterprise-grade Managed IT Services for the Dominican Republic, USA, Canada & Caribbean.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kool Tech Solutions — Enterprise IT & MSP Services",
    description:
      "Enterprise-grade Managed IT Services for the Dominican Republic, USA, Canada & Caribbean.",
  },
  robots: {
    index: true,
    follow: true,
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
