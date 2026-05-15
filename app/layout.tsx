import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/auth/AuthProvider";
import { AuthProvider as AuthContextProvider } from "@/hooks/useAuth";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#7C3AED",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: "%s | ESUTSphere",
    default: "ESUTSphere - The Academic Hub for ESUT",
  },
  description: "Connect, share notes, and excel. The exclusive academic social network for ESUT students.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", type: "image/png" },
    ],
  },
  openGraph: {
    title: "ESUTSphere",
    description: "Connect, share notes, and excel. The exclusive academic social network for ESUT students.",
    url: "https://esutsphere.vercel.app",
    siteName: "ESUTSphere",
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ESUTSphere",
    description: "The Academic Hub for ESUT Students",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${instrumentSerif.variable} antialiased dark`}
    >
      <body className="min-h-screen bg-bg-base text-text-primary font-ui selection:bg-brand selection:text-white">
        <AuthContextProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </AuthContextProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
