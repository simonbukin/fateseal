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
      <body>
        <MantineProvider
          theme={theme}
          defaultColorScheme="dark"
          forceColorScheme="dark"
        >
          <Container>{children}</Container>
        </MantineProvider>
      </body>
    </html>
  );
}
