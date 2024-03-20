import type { Metadata } from "next";
import { Rosario } from "next/font/google";
import "./globals.css";
import "@mantine/core/styles.css";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";

const rosario = Rosario({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fateseal",
  description: "A Tabletop Simulator EDH deck exporter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
      </head>
      <body className={`${rosario.className} bg-stone-100`}>
        <MantineProvider theme={{}}>{children}</MantineProvider>
      </body>
    </html>
  );
}
