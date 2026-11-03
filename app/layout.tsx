import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Web Service Boilerplate",
  description: "Fast E2E web service boilerplate"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
