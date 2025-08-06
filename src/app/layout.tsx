import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Nanum_Gothic } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nanumGothic = Nanum_Gothic({
  variable: "--font-nanum-gothic",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

export const metadata: Metadata = {
  title: "Little Victories",
  description: "A personal blog built with Next.js",
};

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css" 
          integrity="sha384-6oSOzVb16R9vDJALgJ6ReAHbz6T3+vf9nxTwyN0eTblof2vEa0XAnwdHj9+Apz" 
          crossOrigin="anonymous" 
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nanumGothic.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
        {GA_MEASUREMENT_ID && <GoogleAnalytics GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />}
      </body>
    </html>
  );
}
