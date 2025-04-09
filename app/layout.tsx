import localFont from "next/font/local";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/app/providers/AuthProvider"

const poppins = localFont({
  src: [
    {
      path: './fonts/Poppins_500Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/Poppins_600SemiBold.ttf',
      weight: '600',
      style: 'semibold',
    }
  ],
  variable: "--font",
});

const Domine = localFont({
  src:[
    {
      path: './fonts/Domine-VariableFont_wght.ttf',
      weight: '400',
      style: 'normal',
    }
  ],
  variable: '--font-domine'
})

const Nohemi = localFont({
  src:[
    {
      path: './fonts/Nohemi-Medium.ttf',
      style: 'normal',
    }
  ],
  variable: '--font-nohemi'
})

const APP_NAME = "PWA App";
const APP_DEFAULT_TITLE = "My Awesome PWA App";
const APP_TITLE_TEMPLATE = "%s - PWA App";
const APP_DESCRIPTION = "Best PWA app in the world!";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${Nohemi.variable} ${Domine.variable}`}>
    <body
      className={`${poppins.className} antialiased w-full min-h-screen max-h-screen md:max-w-md items-center mx-auto bg-primary`}
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </body>
  </html>
  );
}
