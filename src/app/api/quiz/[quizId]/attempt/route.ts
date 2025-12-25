import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import { Quiz } from '@/lib/models/Quiz';
import { Question } from '@/lib/models/Question';
import { Attempt } from '@/lib/models/Attempt';
import { validateQuizId, validateAnswerSubmission, validateMode } from '@/lib/utils/security';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { quizId: rawQuizId } = await params;
    
    // Validate quiz ID
    const quizIdValidation = validateQuizId(rawQuizId);
    if (!quizIdValidation.valid) {
      return NextResponse.json(
        { error: quizIdValidation.error || 'Invalid quiz ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { answers, mode } = body;

    // Validate mode
    const modeValidation = validateMode(mode);
    if (!modeValidation.valid) {
      return NextResponse.json(
        { error: modeValidation.error || 'Invalid mode' },
        { status: 400 }
      );
    }

    if (!answers) {
      return NextResponse.json(
        { error: 'Answers are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch quiz and questions to validate answers
    const quiz = await Quiz.findOne({ quizId: rawQuizId.trim() });
    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    const questions = await Question.find({
      id: { $in: quiz.questionIds },
    });

    // Validate and sanitize answers
    const answerValidation = validateAnswerSubmission(answers, quiz.questionIds);
    if (!answerValidation.valid) {
      return NextResponse.json(
        { error: answerValidation.error || 'Invalid answers format' },
        { status: 400 }
      );
    }

    const answersArray = answerValidation.sanitized!;

    // Calculate score - only count answered questions
    let score = 0;
    const answerDetails = answersArray.map((answer: { questionId: string; selectedIndex: number }) => {
      const question = questions.find((q) => q.id === answer.questionId);
      const isCorrect = question?.correctIndex === answer.selectedIndex;
      if (isCorrect) score++;

      return {
        questionId: answer.questionId,
        selectedIndex: answer.selectedIndex,
        isCorrect: isCorrect || false,
      };
    });

    // Create attempt
    const attemptId = `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const attempt = new Attempt({
      attemptId,
      userId,
      quizId,
      quizTitle: quiz.title,
      mode,
      answers: answerDetails,
      score,
      totalQuestions: questions.length,
      completedAt: new Date(),
    });

    await attempt.save();

    return NextResponse.json({
      attemptId: attempt.attemptId,
      saved: true,
      score,
      totalQuestions: questions.length,
    });
  } catch (error) {
    console.error('Error saving attempt:', error);
    return NextResponse.json(
      { error: 'Failed to save attempt' },
      { status: 500 }
    );
  }
}

