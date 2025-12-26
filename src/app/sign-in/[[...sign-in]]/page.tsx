"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/";

  return (
    <main
      className="min-h-screen flex flex-col bg-linear-to-br from-background to-background/80"
      aria-label="Sign in page"
    >
      <header className="p-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </header>
      <section
        className="flex-1 flex items-center justify-center p-4"
        aria-label="Sign in form"
      >
        <SignIn
          fallbackRedirectUrl={redirectUrl}
          routing="path"
          path="/sign-in"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-card border border-border shadow-xl rounded-2xl",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton:
                "border-border hover:bg-accent text-foreground",
              formFieldLabel: "text-foreground",
              formFieldInput:
                "bg-background border-border text-foreground focus:ring-primary",
              footerActionLink: "text-primary hover:text-primary/80",
              identityPreviewText: "text-foreground",
              identityPreviewEditButton: "text-primary",
              // Hide organization-related UI completely
              organizationSwitcherTrigger: "hidden",
              organizationSwitcherButton: "hidden",
              organizationPreview: "hidden",
              organizationSwitcher: "hidden",
              organizationSwitcherPopoverCard: "hidden",
              organizationSwitcherPopoverActions: "hidden",
              organizationCreateButton: "hidden",
              organizationCreateForm: "hidden",
            },
          }}
        />
      </section>
    </main>
  );
}
