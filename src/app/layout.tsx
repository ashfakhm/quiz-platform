import { Geist, Geist_Mono } from "next/font/google";
import { WebVitals } from "@/app/_components/WebVitals";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Check if Clerk is properly configured
// In Next.js, NEXT_PUBLIC_* variables are available at build time
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Always wrap with ClerkProvider to ensure Clerk components work
// ClerkProvider requires a publishableKey, so we must provide it
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz Platform",
  description: "A platform to create, manage, and attempt quizzes online.",
};

function ClerkWrapper({ children }: { children: React.ReactNode }) {
  if (!publishableKey) {
    console.error(
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set in environment variables"
    );
    // Still render children to avoid breaking the app
    return <>{children}</>;
  }
  // Always provide ClerkProvider with the publishable key
  // Configure organizations to be optional (not required for sign-in)
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        elements: {
          // Hide organization creation prompts
          organizationSwitcherTrigger: "hidden",
          organizationSwitcherButton: "hidden",
          organizationSwitcher: "hidden",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkWrapper>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <meta name="theme-color" content="#000" />
          <link rel="canonical" href="https://yourdomain.com/" />
          <meta
            name="robots"
            content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
          />
          <meta name="author" content="QuizMaster Pro" />
          <meta
            name="keywords"
            content="quiz, exam, study, MCQ, learning, assessment, education"
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50/50 dark:bg-background selection:bg-primary/20 relative`}
        >
          {/* Global Background Decor */}
          <aside
            className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            <div className="hidden dark:block absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
            <div className="hidden dark:block absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
          </aside>

          {/* Skip to main content link for accessibility */}
          <nav aria-label="Skip to main content">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only absolute top-2 left-2 z-50 rounded bg-primary px-4 py-2 text-primary-foreground shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-ring"
              tabIndex={0}
            >
              Skip to main content
            </a>
          </nav>
          <main
            id="main-content"
            tabIndex={-1}
            className="focus:outline-none relative z-10 w-full h-full"
          >
            <ThemeProvider
              defaultTheme="system"
              storageKey="quiz-platform-theme"
            >
              {children}
            </ThemeProvider>
          </main>
          <WebVitals />
        </body>
      </html>
    </ClerkWrapper>
  );
}
