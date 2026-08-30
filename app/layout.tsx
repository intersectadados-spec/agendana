import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Agenda Ana · Ana Paula Koch Tomacheski",
  description: "Agenda e financeiro do consultório de Ana Paula Koch Tomacheski",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${fraunces.variable} ${workSans.variable} font-body bg-cream text-ink`}>
        {children}
      </body>
    </html>
  );
}
