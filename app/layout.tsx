import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Hasan Durusoy",
    template: "%s | Hasan Durusoy",
  },
  description: "Hasan Durusoy psikoloji kliniği web sitesi.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>
        <a className="skip-link" href="#ana-icerik">
          Ana içeriğe geç
        </a>
        <SiteHeader />
        <div id="ana-icerik">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
