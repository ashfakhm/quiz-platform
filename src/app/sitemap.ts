import type { MetadataRoute } from "next";

// Example: Replace with your actual quiz data source

const quizzes = [
  { quizId: "demo-quiz" },
  // Add more quiz IDs dynamically from your DB if possible
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://yourdomain.com";
  const urls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/quizzes`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    // Add quiz detail pages
    ...quizzes.map((quiz) => ({
      url: `${baseUrl}/quiz/${quiz.quizId}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
  return urls;
}
