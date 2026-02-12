import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#006A4E',
};

export const metadata = {
  title: "Oikkoboddho Bangladesh",
  description: "Oikkoboddho Bangladesh PWA for incident reporting",
  manifest: "/manifest.json",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="Oikkoboddho BD" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Oikkoboddho BD" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/logo.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
