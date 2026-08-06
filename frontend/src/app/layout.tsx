import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "StartupLaunch AI — Multi-Agent Startup Idea Validation",
    template: "%s | StartupLaunch AI",
  },
  description:
    "Enterprise-grade startup idea validation powered by autonomous AI agent swarms. Get instant market research, competitor analysis, risk assessment, and executive recommendations.",
  applicationName: "StartupLaunch AI",
  authors: [{ name: "Afaq Ul Islam", url: "https://github.com/afaqulislam" }],
  creator: "Afaq Ul Islam",
  keywords: [
    "startup validation",
    "AI agents",
    "market research",
    "competitor analysis",
    "risk assessment",
    "StartupLaunch AI",
    "startup idea",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "StartupLaunch AI",
    title: "StartupLaunch AI — Multi-Agent Startup Idea Validation",
    description:
      "Autonomous AI agent swarms validate your startup idea in minutes — market research, competitor analysis, risk assessment, and an executive decision.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "StartupLaunch AI — Multi-Agent Startup Idea Validation",
    description:
      "Autonomous AI agent swarms validate your startup idea in minutes.",
    creator: "@afaqulislam708",
  },
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1020" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${jakarta.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-indigo-500/30 selection:text-indigo-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
