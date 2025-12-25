"use client";
import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    // You can send these metrics to an analytics endpoint
    // or just log them for debugging
    // Example: fetch('/analytics', { method: 'POST', body: JSON.stringify(metric) })
    // For now, just log:
    if (process.env.NODE_ENV === "development") {
      console.log(metric);
    }
  });
  return null;
}
