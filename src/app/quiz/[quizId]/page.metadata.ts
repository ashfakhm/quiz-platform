import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { quizId: string };
}): Promise<Metadata> {
  // You can fetch quiz details here for dynamic SEO
  // For now, use a generic fallback
  return {
    title: `Quiz | QuizMaster Pro`,
    description: `Take this quiz and test your knowledge on QuizMaster Pro!`,
    openGraph: {
      title: `Quiz | QuizMaster Pro`,
      description: `Take this quiz and test your knowledge on QuizMaster Pro!`,
      type: "website",
      url: `https://yourdomain.com/quiz/${params.quizId}`,
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "QuizMaster Pro Open Graph Image",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Quiz | QuizMaster Pro`,
      description: `Take this quiz and test your knowledge on QuizMaster Pro!`,
      images: ["/og-image.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://yourdomain.com/quiz/${params.quizId}`,
      languages: {
        "en-US": `https://yourdomain.com/en-US/quiz/${params.quizId}`,
      },
    },
  };
}
