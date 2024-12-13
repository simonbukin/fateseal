"use client";

import { Text } from "@mantine/core";
import Link from "next/link";

function Footer() {
  return (
    <footer className="w-full py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Text size="sm" className="text-slate-600">
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
          <div className="flex gap-6">
            <Link
              href="/faq"
              className="text-sm text-slate-600 hover:text-purple-600 transition-colors"
            >
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
