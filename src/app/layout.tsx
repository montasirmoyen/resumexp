import { Geist_Mono, Figtree } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { Navbar } from '@/components/navbar1';
import { Footer } from "@/components/footer1";
import { AuthProvider } from '@/contexts/auth-context';

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = {
  title: "ResumeXP",
  description:
    "ResumeXP is an AI-powered resume analysis and optimization tool that helps job seekers improve their resumes and increase their chances of landing their dream jobs. With advanced natural language processing and machine learning algorithms, ResumeXP provides personalized feedback and actionable insights to enhance your resume's effectiveness.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", figtree.variable)}
    >
      <body>
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            {children}
            <Footer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
