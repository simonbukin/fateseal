import type { Metadata } from "next";
import { Rosario } from "next/font/google";
import "./globals.css";
import "@mantine/core/styles.css";
import {
  ColorSchemeScript,
  MantineProvider,
  Container,
  createTheme,
} from "@mantine/core";
import Footer from "@/components/Footer";

const rosario = Rosario({ subsets: ["latin"] });

const theme = createTheme({
  black: "#1e293b",
  white: "#f5f5f4",
  fontFamily: rosario.style.fontFamily,
});

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
      <body className="min-h-screen flex flex-col">
        <MantineProvider
          theme={theme}
          defaultColorScheme="light"
          forceColorScheme="light"
        >
          <Container className="flex-1">{children}</Container>
          <Footer />
        </MantineProvider>
      </body>
    </html>
  );
}
