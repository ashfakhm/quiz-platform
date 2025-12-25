import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QuizMaster Pro | Study & Exam Mode",
  description:
    "A premium MCQ quiz platform with Study Mode for learning and Exam Mode for self-assessment. Track your progress and master any subject.",
  openGraph: {
    title: "QuizMaster Pro | Study & Exam Mode",
    description:
      "A premium MCQ quiz platform with Study Mode for learning and Exam Mode for self-assessment.",
    type: "website",
    url: "https://yourdomain.com/",
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
    title: "QuizMaster Pro | Study & Exam Mode",
    description:
      "A premium MCQ quiz platform with Study Mode for learning and Exam Mode for self-assessment.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://yourdomain.com/",
    languages: {
      "en-US": "https://yourdomain.com/en-US",
    },
  },
};
