import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import AuthProvider from "@/components/AuthProvider"

const poppins = Poppins({ weight: ["400", "500", "600", "700"], subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Task Tracking",
  description: "Project management dashboard",
  manifest: "/manifest.json",
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        <AuthProvider>{children}
          <Analytics /></AuthProvider>
      </body>
    </html>
  )
}
