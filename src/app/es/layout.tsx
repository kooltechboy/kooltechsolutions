import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    locale: "es_LA",
  },
};

export default function SpanishLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
