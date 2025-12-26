// Next.js 16.1: Use native Request/Response Web APIs
import connectDB from "@/lib/db/mongodb";
import { Quiz } from "@/lib/models/Quiz";
import { Question } from "@/lib/models/Question";
import { validateQuizId } from "@/lib/utils/security";

export async function GET(
  request: Request,
  context: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId: rawQuizId } = await context.params;

    // Validate quiz ID to prevent injection
    const quizIdValidation = validateQuizId(rawQuizId);
    if (!quizIdValidation.valid) {
      return new Response(
        JSON.stringify({ error: quizIdValidation.error || "Invalid quiz ID" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const quizId = rawQuizId.trim();

    // Connect to database
    try {
      await connectDB();
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return new Response(
        JSON.stringify({
          error: "Database connection failed",
          details:
            process.env.NODE_ENV === "development"
              ? String(dbError)
              : undefined,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Find the quiz
    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) {
      console.error(`Quiz not found: ${quizId}`);
      return new Response(
        JSON.stringify({
          error: "Quiz not found",
          quizId,
          message: `Quiz with ID "${quizId}" does not exist in the database. Please run "npm run seed" to populate the database.`,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch all questions for this quiz
    const questionsDocs = await Question.find({
      id: { $in: quiz.questionIds },
    });

    if (questionsDocs.length === 0) {
      console.error(
        `No questions found for quiz: ${quizId}. Question IDs: ${quiz.questionIds.join(
          ", "
        )}`
      );
      return new Response(
        JSON.stringify({
          error: "No questions found for this quiz",
          quizId,
          message: `Quiz "${quizId}" exists but has no questions. Please run "npm run seed" to populate questions.`,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Sort questions based on the order in quiz.questionIds (Source of Truth)
    const questions = questionsDocs.sort((a, b) => {
      return quiz.questionIds.indexOf(a.id) - quiz.questionIds.indexOf(b.id);
    });

    // Map to the expected format
    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex, // Include for client-side scoring
      explanation: q.explanation, // Include explanation
      context: q.context, // Include context for passage-based questions
      groupId: q.groupId, // Include groupId for grouping
      mark: q.mark, // Include mark for scoring
    }));

    return new Response(
      JSON.stringify({
        quizId: quiz.quizId,
        title: quiz.title,
        questions: formattedQuestions,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch quiz questions" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
