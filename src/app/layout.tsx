import type { Metadata } from "next";
import { Montserrat, Oswald } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/script";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thestudentblueprint.com"),
  title: "The Student Blueprint",
  description: "Data-driven personalized college admissions roadmaps",
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: "The Student Blueprint",
    description: "Data-driven personalized college admissions roadmaps",
    images: [
      {
        url: "/og-thumbnail.png",
        width: 1200,
        height: 630,
        alt: "The Student Blueprint - Data-driven personalized college admissions roadmaps",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Student Blueprint",
    description: "Data-driven personalized college admissions roadmaps",
    images: ["/og-thumbnail.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${oswald.variable} antialiased`}
        style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="00b37a2c-34c2-4f28-97d1-cd7b875c6e41"
        />
          {children}
          <Toaster position="top-center" richColors />
        </body>
    </html>
  );
}