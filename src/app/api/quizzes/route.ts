/* eslint-disable @typescript-eslint/no-explicit-any */
// Next.js 16.1: Use native Request/Response Web APIs
import connectDB from "@/lib/db/mongodb";
import { Quiz } from "@/lib/models/Quiz";

// GET all quizzes (public - for users to see available quizzes)
export async function GET() {
  try {
    await connectDB();

    // Fetch all quizzes
    const quizzes = await Quiz.find({})
      .sort({ createdAt: -1 })
      .select("quizId title description questionIds")
      .lean();

    const formattedQuizzes = quizzes.map((quiz) => ({
      quizId: quiz.quizId,
      title: quiz.title,
      description: quiz.description || "",
      questionCount: quiz.questionIds.length,
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
