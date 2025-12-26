// Next.js 16.1: Use native Request/Response Web APIs
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongodb";
import { Quiz } from "@/lib/models/Quiz";
import { Question } from "@/lib/models/Question";
import { Attempt } from "@/lib/models/Attempt";
import {
  validateQuizId,
  validateAnswerSubmission,
  validateMode,
} from "@/lib/utils/security";

export async function POST(
  request: Request,
  context: { params: Promise<{ quizId: string }> }
) {
  try {
    const { userId } = await auth();
    console.log(`[API] Processing attempt submission for user: ${userId}`);
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { quizId: rawQuizId } = await context.params;

    // Validate quiz ID
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

    const body = await request.json();
    const { answers, mode } = body;

    // Validate mode
    const modeValidation = validateMode(mode);
    if (!modeValidation.valid) {
      return new Response(
        JSON.stringify({ error: modeValidation.error || "Invalid mode" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!answers) {
      return new Response(JSON.stringify({ error: "Answers are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await connectDB();

    // Fetch quiz and questions to validate answers
    const quiz = await Quiz.findOne({ quizId: rawQuizId.trim() });
    if (!quiz) {
      return new Response(JSON.stringify({ error: "Quiz not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const questions = await Question.find({
      id: { $in: quiz.questionIds },
    });

    // Validate and sanitize answers
    const answerValidation = validateAnswerSubmission(
      answers,
      quiz.questionIds
    );
    if (!answerValidation.valid) {
      return new Response(
        JSON.stringify({
          error: answerValidation.error || "Invalid answers format",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const answersArray = answerValidation.sanitized!;

    // Calculate score and stats with per-question mark and negative marking
    let score = 0;
    let attempted = 0;
    let correct = 0;
    let incorrect = 0;
    const answerDetails = answersArray.map(
      (answer: { questionId: string; selectedIndex: number }) => {
        const question = questions.find((q) => q.id === answer.questionId);
        const mark = question?.mark ?? 1;
        const isCorrect = question?.correctIndex === answer.selectedIndex;

        if (
          answer.selectedIndex !== undefined &&
          answer.selectedIndex !== null
        ) {
          attempted++;
        }
        if (isCorrect) {
          score += mark;
          correct++;
        } else {
          // Negative marking: 0.25% of the mark for this question
          score -= mark * 0.0025;
          incorrect++;
        }

        return {
          questionId: answer.questionId,
          selectedIndex: answer.selectedIndex,
          isCorrect: isCorrect || false,
        };
      }
    );

    // Determine result (Pass/Fail) - for now, pass if >= 40% correct
    const passPercentage = 0.4;
    const result =
      correct / questions.length >= passPercentage ? "Pass" : "Fail";

    // Create attempt
    const attemptId = `attempt-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const attempt = new Attempt({
      attemptId,
      userId,
      quizId: rawQuizId.trim(),
      quizTitle: quiz.title,
      mode,
      answers: answerDetails,
      score,
      totalQuestions: questions.length,
      attempted,
      correct,
      incorrect,
      result,
      completedAt: new Date(),
    });

    await attempt.save();
    console.log(
      `[API] Attempt saved successfully: ${attempt.attemptId} with score ${score}`
    );

    return new Response(
      JSON.stringify({
        attemptId: attempt.attemptId,
        saved: true,
        score,
        totalQuestions: questions.length,
        attempted,
        correct,
        incorrect,
        result,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error saving attempt:", error);
    return new Response(JSON.stringify({ error: "Failed to save attempt" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
