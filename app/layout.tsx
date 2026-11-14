import type { Metadata } from "next";
import { AppProvider } from "@/components/app-provider";
import "./globals.css";
export const metadata: Metadata = { title: "bloomi · Your learning companion", description: "A welcoming fictional demo for learning, one step at a time." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><AppProvider>{children}</AppProvider></body></html>;
}
