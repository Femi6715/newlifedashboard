import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import LayoutInner from "./LayoutInner"
import { SocketProvider } from "@/components/socket-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NewLife Recovery Center - Dashboard",
  description: "A New Beginning in Recovery - Comprehensive recovery center management system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          storageKey="newlife-theme"
        >
          <SocketProvider>
            <LayoutInner>
              {children}
            </LayoutInner>
          </SocketProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
