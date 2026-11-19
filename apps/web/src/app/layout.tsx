import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "./PwaRegister";

export const metadata: Metadata = {
  title: {
    default: "NetFilms — Movies in Kinyarwanda",
    template: "%s | NetFilms",
  },
  description:
    "Discover movies translated into Kinyarwanda. Explore films, meet translators and continue watching.",
  applicationName: "NetFilms",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "NetFilms" },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="rw">
      <body><PwaRegister />{children}</body>
    </html>
  );
}
