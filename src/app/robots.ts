import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://yourdomain.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/quizzes", "/quiz/"],
        disallow: [
          "/sign-in",
          "/sign-up",
          "/dashboard",
          "/admin",
          "/401",
          "/403",
          "/404",
          "/500",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml}`,
  };
}
