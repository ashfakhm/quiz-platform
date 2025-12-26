/* eslint-disable @typescript-eslint/no-explicit-any */
// Next.js 16.1: Use native Request/Response Web APIs
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongodb";
import { Quiz } from "@/lib/models/Quiz";
import { isAdmin } from "@/lib/utils/admin-server";

// GET all quizzes (admin only)
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if user is admin
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return new Response(
        JSON.stringify({
          error: "Forbidden: Only administrators can view quizzes",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    await connectDB();

    // Fetch all quizzes
    const quizzes = await Quiz.find({}).sort({ createdAt: -1 }).lean();

    const formattedQuizzes = quizzes.map((quiz) => ({
      quizId: quiz.quizId,
      title: quiz.title,
      description: quiz.description || "",
      questionCount: quiz.questionIds.length,
      createdAt:
        quiz.createdAt instanceof Date
          ? quiz.createdAt.toISOString()
          : new Date(quiz.createdAt).toISOString(),
      updatedAt:
        quiz.updatedAt instanceof Date
          ? quiz.updatedAt.toISOString()
          : new Date(quiz.updatedAt).toISOString(),
    }));

    return new Response(JSON.stringify({ quizzes: formattedQuizzes }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error fetching quizzes:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch quizzes" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
