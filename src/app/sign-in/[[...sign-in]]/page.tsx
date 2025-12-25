"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/";

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-background/80 p-4">
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
    </div>
  );
}
