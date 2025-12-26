import Link from "next/link";
import type { Route } from "next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <AuroraBackground>
      <main
        className="min-h-screen flex items-center justify-center p-4"
        aria-label="Unauthorized error"
      >
        <section className="w-full max-w-md" aria-label="401 error card">
          <Card className="w-full text-center">
            <CardHeader>
              <CardTitle className="text-3xl font-bold mb-2">
                401 - Unauthorized
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-muted-foreground">
                You must be signed in to view this page.
              </p>
              <Link href={"/sign-in" as Route}>
                <Button className="gap-2" variant="outline">
                  <ArrowLeft className="w-4 h-4" />
                  Go to Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </AuroraBackground>
  );
}
