import { Route, Switch } from "wouter";
import { MantineProvider, Container, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useLocation } from "wouter";

import HomePage from "./pages/HomePage";
import FAQPage from "./pages/FAQPage";
import Footer from "./components/Footer";
import { DeckProvider } from "./store/deckContext";

const theme = createTheme({
  black: "#1e293b",
  white: "#f5f5f4",
  fontFamily:
    '"Epilogue", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
});

function PageViewTracker() {
  const [location] = useLocation();

  useEffect(() => {
    posthog.capture("$pageview", {
      $current_url: window.origin + location,
    });
  }, [location]);

  return null;
}

function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (import.meta.env.VITE_POSTHOG_KEY) {
      posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
        api_host: import.meta.env.VITE_POSTHOG_HOST,
        capture_pageview: false,
        capture_pageleave: true,
        session_recording: {
          maskAllInputs: false,
          maskInputOptions: {
            password: true,
          },
        },
      });
    }
  }, []);

  return (
    <PostHogProvider client={posthog}>
      <PageViewTracker />
      {children}
    </PostHogProvider>
  );
}

export default function App() {
  return (
    <AnalyticsProvider>
      <MantineProvider
        theme={theme}
        defaultColorScheme="light"
      >
        <DeckProvider>
          <Notifications position="top-right" />
          <div className="min-h-screen flex flex-col">
            <Container className="flex-1">
              <Switch>
                <Route path="/" component={HomePage} />
                <Route path="/faq" component={FAQPage} />
                <Route>
                  <div className="text-center py-16">
                    <h1 className="text-2xl font-bold">404 - Not Found</h1>
                  </div>
                </Route>
              </Switch>
            </Container>
            <Footer />
          </div>
        </DeckProvider>
      </MantineProvider>
    </AnalyticsProvider>
  );
}
