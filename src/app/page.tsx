"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AuroraBackground } from "@/components/ui/aurora-background";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Trophy,
  Zap,
} from "lucide-react";
import gsap from "gsap";

// Dynamically import Clerk components to handle missing configuration
const ClerkComponents = dynamic(
  () => import("@/components/auth/ClerkComponents"),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const [clerkConfigured, setClerkConfigured] = useState(false);
  const { isSignedIn, isLoaded: authLoaded } = useUser();
  const [quizzes, setQuizzes] = useState<
    Array<{ quizId: string; title: string }>
  >([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  useEffect(() => {
    // Check if Clerk is configured
    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    // Avoid calling setState synchronously in effect
    if (key) {
      setTimeout(() => {
        setClerkConfigured(key.startsWith("pk_"));
      }, 0);
    }
  }, []);

  // Fetch available quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch("/api/quizzes");
        if (response.ok) {
          const data = await response.json();
          setQuizzes(data.quizzes || []);
        }
      } catch (err) {
        console.error("Failed to fetch quizzes:", err);
      } finally {
        setLoadingQuizzes(false);
      }
    };
    fetchQuizzes();
  }, []);

  // Handle "Start Learning" click
  const handleStartLearning = () => {
    if (quizzes.length > 0) {
      // Always go to quizzes page to show selection
      window.location.href = "/quizzes";
    } else {
      // No quizzes - show message or stay on page
      alert("No quizzes available at the moment.");
    }
  };

  useEffect(() => {
    // Hero animation
    if (heroRef.current) {
      const elements = heroRef.current.querySelectorAll(".animate-in");
      gsap.fromTo(
        elements,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
        }
      );
    }

    // Features animation on scroll
    if (featuresRef.current) {
      const features = featuresRef.current.querySelectorAll(".feature-card");
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                entry.target,
                { opacity: 0, y: 40, scale: 0.95 },
                {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.6,
                  ease: "power2.out",
                }
              );
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );

      features.forEach((feature) => observer.observe(feature));
      return () => observer.disconnect();
    }
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: "Study Mode",
      description:
        "Learn with immediate feedback and detailed explanations for every question.",
      gradient: "from-blue-500 to-purple-500",
    },
    {
      icon: ClipboardCheck,
      title: "Exam Mode",
      description:
        "Test yourself without hints. See your complete results only after submission.",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: Trophy,
      title: "Track Progress",
      description:
        "Monitor your improvement over time with detailed analytics and history.",
      gradient: "from-orange-500 to-rose-500",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description:
        "Get your score immediately with comprehensive review of all answers.",
      gradient: "from-violet-500 to-fuchsia-500",
    },
  ];

  return (
    <AuroraBackground>
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-4 md:p-6 overflow-hidden">
        <div className="flex items-center gap-2 min-w-0 shrink">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary/50 flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-lg">Q</span>
          </div>
          <span className="text-xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent hidden sm:inline">
            QuizMaster
          </span>
          {/* Accessibility: Skip to main content */}
          <a
            href="#main-content"
            id="skip-to-main"
            className="sr-only focus:not-sr-only absolute left-4 -top-25 z-50 bg-primary text-primary-foreground px-4 py-2 rounded transition-all duration-200"
            tabIndex={0}
          >
            Skip to main content
          </a>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <ThemeToggle />
          {clerkConfigured ? (
            <ClerkComponents />
          ) : (
            <Button
              onClick={handleStartLearning}
              disabled={loadingQuizzes}
              size="sm"
              className="text-xs sm:text-sm"
            >
              {loadingQuizzes ? "Loading..." : "Start Quiz"}
            </Button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative z-10 flex flex-col items-center justify-center px-4 py-20 md:py-32 text-center"
        >
          <div className="animate-in inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Study & Exam Modes
          </div>

          <h1 className="animate-in text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mb-6">
            <span className="bg-linear-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Master Any Subject with{" "}
            </span>
            <span className="bg-linear-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Confidence
            </span>
          </h1>

          <p className="animate-in text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
            A premium quiz platform designed for serious learners. Study mode
            for learning, exam mode for testing. Track your progress and achieve
            your goals.
          </p>

          <div className="animate-in flex flex-col sm:flex-row items-center gap-4">
            {clerkConfigured && authLoaded && !isSignedIn ? (
              // Show Clerk Sign In button for unauthenticated users
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="gap-2 bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 h-12 px-8"
                >
                  Start Learning Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </SignInButton>
            ) : (
              // Allow authenticated users or when Clerk not configured
              <Button
                size="lg"
                className="gap-2 bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 h-12 px-8"
                onClick={handleStartLearning}
                disabled={loadingQuizzes}
              >
                {loadingQuizzes ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Start Learning Now
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section
          ref={featuresRef}
          className="relative z-10 px-4 py-20 md:py-32"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to{" "}
                <span className="bg-linear-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  Succeed
                </span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Designed with precision. Built for learners who want results.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="feature-card group relative p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300"
                  style={{ opacity: 0 }}
                >
                  {/* Gradient glow on hover */}
                  <div
                    className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-linear-to-br ${feature.gradient}`}
                  />

                  <div
                    className={`w-12 h-12 rounded-xl bg-linear-to-br ${feature.gradient} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative p-8 md:p-12 rounded-3xl border border-border/50 bg-linear-to-br from-card/80 to-card/40 backdrop-blur-xl overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  Join thousands of learners who have improved their knowledge
                  with our platform. Start learning today.
                </p>

                {clerkConfigured && authLoaded && !isSignedIn ? (
                  // Show Clerk Sign Up button for unauthenticated users
                  <SignUpButton mode="modal" fallbackRedirectUrl="/">
                    <Button
                      size="lg"
                      className="gap-2 bg-linear-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-lg h-12 px-8 relative z-10"
                    >
                      Get Started Free
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </SignUpButton>
                ) : (
                  // Allow authenticated users
                  <Button
                    size="lg"
                    className="gap-2 bg-linear-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-lg h-12 px-8 relative z-10"
                    onClick={handleStartLearning}
                    disabled={loadingQuizzes}
                  >
                    {loadingQuizzes ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Get Started Free
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 px-4 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-primary/50 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                Q
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {`QuizMaster Pro © ${new Date().getFullYear()}. All rights reserved.`}
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </AuroraBackground>
  );
}
