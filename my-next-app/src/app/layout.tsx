import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CustomToaster } from "@/components/ui/CustomToaster"
import "./globals.css";
import { ThemeProvider } from "./settings/system/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flow",
  description: "ここにアプリの説明を記入",
  icons: {
    icon: "../../public/FLOW-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
					<CustomToaster/>
        </ThemeProvider>
      </body>
    </html>
  );
}
