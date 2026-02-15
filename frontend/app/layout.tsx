import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const metadata: Metadata = {
  title: "AI Nexus",
  description: "An AI chat application built with Next.js and FastAPI, all by hand, no code generation tools (or AI) used.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const client = new QueryClient();

  return (
    <html lang="en">
      <head>
        {/* React Grab */}
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body>
        <QueryClientProvider client={client}>
        {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
