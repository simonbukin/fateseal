import { Text, ActionIcon, useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import { Link } from "wouter";
import { useEffect } from "react";

function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light");

  // Sync with CSS data-theme attribute for Tailwind
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", computedColorScheme);
  }, [computedColorScheme]);

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === "dark" ? "light" : "dark");
  };

  return (
    <ActionIcon
      variant="subtle"
      color="gray"
      onClick={toggleColorScheme}
      aria-label="Toggle color scheme"
      size="lg"
    >
      {computedColorScheme === "dark" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </ActionIcon>
  );
}

function Footer() {
  return (
    <footer className="w-full py-8 mt-auto border-t border-[var(--border-color)]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Text size="sm" className="text-[var(--text-secondary)]">
            Built by{" "}
            <a
              href="https://simonbukin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-800 transition-colors"
            >
              Simon Bukin
            </a>
          </Text>
          <div className="flex items-center gap-6">
            <Link
              href="/faq"
              className="text-sm text-[var(--text-secondary)] hover:text-purple-600 transition-colors"
            >
              FAQ
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
