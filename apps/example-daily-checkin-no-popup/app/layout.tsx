import "./globals.css"

import clsx from "clsx"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Daily Check-In",
  description: "Do your daily check-in to earn rewards with Ronin Waypoint!",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={clsx("bg-gradient text-slate-700", inter.className)}>{children}</body>
    </html>
  )
}
