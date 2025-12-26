import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-background to-background/80">
      <header className="p-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center p-4">
      <SignUp
        fallbackRedirectUrl="/"
        routing="path"
        path="/sign-up"
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
    </div>
  );
}
