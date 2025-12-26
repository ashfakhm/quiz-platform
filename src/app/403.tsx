import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <AuroraBackground>
      <main
        className="min-h-screen flex items-center justify-center p-4"
        aria-label="Access forbidden error"
      >
        <section className="w-full max-w-md" aria-label="403 error card">
          <Card className="w-full text-center">
            <CardHeader>
              <CardTitle className="text-3xl font-bold mb-2">
                403 - Access Forbidden
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-muted-foreground">
                You do not have permission to view this page.
              </p>
              <Link href="/">
                <Button className="gap-2" variant="outline">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </AuroraBackground>
  );
}
