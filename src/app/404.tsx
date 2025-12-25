import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <AuroraBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-2">
              404 - Page Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-muted-foreground">
              Sorry, the page you are looking for does not exist or has been
              moved.
            </p>
            <Link href="/">
              <Button className="gap-2" variant="outline">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AuroraBackground>
  );
}
