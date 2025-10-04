import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import StatusBar from "@/components/StatusBar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Claude Config Manager",
  description: "Manage Claude Desktop and Claude Code configurations",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} auto-hide-scrollbar`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen pb-16">
            {children}
          </div>
          <StatusBar />
        </ThemeProvider>
      </body>
    </html>
  )
}