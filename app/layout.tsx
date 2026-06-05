import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://github-calendar-kappa.vercel.app"),
  title: "github-calendar — GitHub-style heatmap for React",
  description:
    "A fully customizable, client-side fetched GitHub contributions heatmap for React. Support preset themes, tooltips, custom cell shapes, and more.",
  openGraph: {
    title: "github-calendar — GitHub-style heatmap for React",
    description:
      "A fully customizable, client-side fetched GitHub contributions heatmap for React. Support preset themes, tooltips, custom cell shapes, and more.",
    url: "https://github-calendar-kappa.vercel.app",
    siteName: "GitHub Calendar",
    images: [
      {
        url: "/og-image.png",
        width: 1024,
        height: 1024,
        alt: "github-calendar component preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "github-calendar — GitHub-style heatmap for React",
    description:
      "A fully customizable, client-side fetched GitHub contributions heatmap for React. Support preset themes, tooltips, custom cell shapes, and more.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b]">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
