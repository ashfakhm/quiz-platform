import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import { Quiz } from '@/lib/models/Quiz';
import { Question } from '@/lib/models/Question';
import { isAdmin } from '@/lib/utils/admin-server';
import {
  validateQuizId,
  validateQuizTitle,
  validateQuizDescription,
  validateQuestionId,
  validateQuestionText,
  validateOptions,
  validateCorrectIndex,
  validateQuestionsArray,
  MAX_QUESTIONS_PER_QUIZ,
} from '@/lib/utils/security';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Forbidden: Only administrators can create quizzes' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { quizId, title, description, questions } = body;

    // Validate quiz ID
    const quizIdValidation = validateQuizId(quizId);
    if (!quizIdValidation.valid) {
      return NextResponse.json(
        { error: quizIdValidation.error },
        { status: 400 }
      );
    }

    // Validate title
    const titleValidation = validateQuizTitle(title);
    if (!titleValidation.valid) {
      return NextResponse.json(
        { error: titleValidation.error },
        { status: 400 }
      );
    }

    // Validate description
    const descValidation = validateQuizDescription(description);
    if (!descValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid description format' },
        { status: 400 }
      );
    }

    // Validate questions array
    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Questions must be an array' },
        { status: 400 }
      );
    }

    const questionsValidation = validateQuestionsArray(questions);
    if (!questionsValidation.valid) {
      return NextResponse.json(
        { error: questionsValidation.error },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if quiz ID already exists
    const existingQuiz = await Quiz.findOne({ quizId });
    if (existingQuiz) {
      return NextResponse.json(
        { error: 'Quiz ID already exists. Please choose a different ID.' },
        { status: 400 }
      );
    }

    // Validate and check for duplicate IDs within the submitted questions
    const questionIds = new Set<string>();
    const duplicateIds: string[] = [];
    for (const q of questions) {
      // Validate question ID
      const qIdValidation = validateQuestionId(q.id);
      if (!qIdValidation.valid) {
        return NextResponse.json(
          { error: qIdValidation.error || 'Invalid question ID' },
          { status: 400 }
        );
      }

      const sanitizedId = q.id.trim();
      if (questionIds.has(sanitizedId)) {
        duplicateIds.push(sanitizedId);
      }
      questionIds.add(sanitizedId);
    }

    if (duplicateIds.length > 0) {
      return NextResponse.json(
        { error: `Duplicate question IDs found: ${duplicateIds.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate and prepare questions
    const questionDocs = [];
    const questionIdsToUpdate: string[] = [];
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const sanitizedId = q.id.trim();

      // Validate question text
      const questionTextValidation = validateQuestionText(q.question);
      if (!questionTextValidation.valid) {
        return NextResponse.json(
          { error: `Question ${i + 1}: ${questionTextValidation.error}` },
          { status: 400 }
        );
      }

      // Validate options
      const optionsValidation = validateOptions(q.options);
      if (!optionsValidation.valid) {
        return NextResponse.json(
          { error: `Question ${i + 1}: ${optionsValidation.error}` },
          { status: 400 }
        );
      }

      // Validate correct index
      const correctIndexValidation = validateCorrectIndex(
        q.correctIndex ?? 0,
        optionsValidation.sanitized!.length
      );
      if (!correctIndexValidation.valid) {
        return NextResponse.json(
          { error: `Question ${i + 1}: ${correctIndexValidation.error}` },
          { status: 400 }
        );
      }

      // Validate explanation
      const explanation = q.explanation || { format: 'markdown', content: '' };
      if (typeof explanation !== 'object' || !explanation.content) {
        return NextResponse.json(
          { error: `Question ${i + 1}: Explanation is required` },
          { status: 400 }
        );
      }

      // Check if question ID already exists in database
      const existingQuestion = await Question.findOne({ id: sanitizedId });
      
      if (existingQuestion) {
        // Update existing question instead of creating new one
        existingQuestion.question = questionTextValidation.sanitized!;
        existingQuestion.options = optionsValidation.sanitized!;
        existingQuestion.correctIndex = q.correctIndex ?? 0;
        existingQuestion.explanation = {
          format: explanation.format === 'text' ? 'text' : 'markdown',
          content: String(explanation.content).slice(0, 5000),
        };
        await existingQuestion.save();
        questionIdsToUpdate.push(sanitizedId);
      } else {
        // New question to create
        questionDocs.push({
          id: sanitizedId,
          question: questionTextValidation.sanitized!,
          options: optionsValidation.sanitized!,
          correctIndex: q.correctIndex ?? 0,
          explanation: {
            format: explanation.format === 'text' ? 'text' : 'markdown',
            content: String(explanation.content).slice(0, 5000),
          },
        });
      }
    }

    // Insert new questions (if any)
    let insertedQuestions = [];
    if (questionDocs.length > 0) {
      insertedQuestions = await Question.insertMany(questionDocs);
    }

    // Get all question IDs (both updated and newly inserted)
    const allQuestionIds = [
      ...questionIdsToUpdate,
      ...insertedQuestions.map((q) => q.id),
    ];

    // Create quiz with sanitized data
    const quiz = new Quiz({
      quizId: quizId.trim(),
      title: titleValidation.sanitized!,
      description: descValidation.sanitized || '',
      questionIds: allQuestionIds,
    });

    await quiz.save();

    return NextResponse.json({
      success: true,
      quizId: quiz.quizId,
      title: quiz.title,
      questionCount: allQuestionIds.length,
      newQuestions: insertedQuestions.length,
      updatedQuestions: questionIdsToUpdate.length,
    });
  } catch (error: any) {
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create quiz' },
      { status: 500 }
    );
  }
}

