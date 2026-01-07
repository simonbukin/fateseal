import type { Metadata } from "next";
import { Epilogue } from "next/font/google";
import "./globals.css";
import "@mantine/core/styles.css";
import {
  ColorSchemeScript,
  MantineProvider,
  Container,
  createTheme,
} from "@mantine/core";
import Footer from "@/components/Footer";
import { CSPostHogProvider } from "./providers";

const epilogue = Epilogue({ subsets: ["latin"] });

const theme = createTheme({
  black: "#1e293b",
  white: "#f5f5f4",
  fontFamily: epilogue.style.fontFamily,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fateseal.com"),
  title: "Fateseal | MTG Deck Converter for Tabletop Simulator",
  description:
    "Convert Magic: The Gathering Commander/EDH decklists to Tabletop Simulator format. Free deck testing tool supporting all Commander-legal cards, tokens, and double-faced cards.",
  keywords:
    "MTG, Magic The Gathering, EDH, Commander, Tabletop Simulator, TTS, deck converter, deck tester, deck builder, playtest",
  openGraph: {
    title: "Fateseal | MTG Deck Converter for Tabletop Simulator",
    description:
      "Convert Magic: The Gathering Commander/EDH decklists to Tabletop Simulator format. Free deck testing tool supporting all Commander-legal cards, tokens, and double-faced cards.",
    type: "website",
    url: "https://fateseal.com",
    images: [
      {
        url: "/favicon.svg",
        width: 128,
        height: 128,
        alt: "Fateseal MTG Deck Converter",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={epilogue.className} suppressHydrationWarning>
      <head>
        <ColorSchemeScript forceColorScheme="light" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <script
          data-goatcounter="https://fateseal.goatcounter.com/count"
          async
          src="//gc.zgo.at/count.js"
        ></script>
      </head>
      <body className="min-h-screen flex flex-col">
        <CSPostHogProvider>
          <MantineProvider
            theme={theme}
            defaultColorScheme="light"
            forceColorScheme="light"
          >
            <Container className="flex-1">{children}</Container>
            <Footer />
          </MantineProvider>
        </CSPostHogProvider>
      </body>
    </html>
  );
}
