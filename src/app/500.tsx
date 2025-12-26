import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { ArrowLeft } from "lucide-react";

export default function ServerErrorPage() {
  return (
    <AuroraBackground>
      <main
        className="min-h-screen flex items-center justify-center p-4"
        aria-label="Server error"
      >
        <section className="w-full max-w-md" aria-label="500 error card">
          <Card className="w-full text-center">
            <CardHeader>
              <CardTitle className="text-3xl font-bold mb-2">
                500 - Server Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-muted-foreground">
                Oops! Something went wrong on our end. Please try again later.
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
