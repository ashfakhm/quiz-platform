import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import { Quiz } from '@/lib/models/Quiz';
import { Question } from '@/lib/models/Question';
import { Attempt } from '@/lib/models/Attempt';
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
} from '@/lib/utils/security';

// GET quiz details with questions (for editing)
export async function GET(
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

    // Check if user is admin
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Forbidden: Only administrators can view quiz details' },
        { status: 403 }
      );
    }

    const { quizId } = await params;
    await connectDB();

    // Find the quiz
    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Fetch all questions for this quiz
    const questions = await Question.find({
      id: { $in: quiz.questionIds },
    }).sort({ id: 1 });

    // Format questions
    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      context: q.context,
      groupId: q.groupId,
    }));

    return NextResponse.json({
      quizId: quiz.quizId,
      title: quiz.title,
      description: quiz.description || '',
      questions: formattedQuestions,
    });
  } catch (error: any) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}

// PUT update quiz
export async function PUT(
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

    // Check if user is admin
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Forbidden: Only administrators can update quizzes' },
        { status: 403 }
      );
    }

    const { quizId: rawQuizId } = await params;
    const body = await request.json();
    const { title, description, questions } = body;

    // Validate quiz ID from params
    const quizIdValidation = validateQuizId(rawQuizId);
    if (!quizIdValidation.valid) {
      return NextResponse.json(
        { error: quizIdValidation.error || 'Invalid quiz ID' },
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

    // Find the quiz
    const quiz = await Quiz.findOne({ quizId: rawQuizId.trim() });
    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
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

    // Process questions - update existing or create new
    const questionDocs = [];
    const questionIdsToUpdate: string[] = [];
    const newQuestionIds: string[] = [];

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

      const existingQuestion = await Question.findOne({ id: sanitizedId });

      if (existingQuestion) {
        // Update existing question with sanitized data
        existingQuestion.question = questionTextValidation.sanitized!;
        existingQuestion.options = optionsValidation.sanitized!;
        existingQuestion.correctIndex = q.correctIndex ?? 0;
        existingQuestion.explanation = {
          format: explanation.format === 'text' ? 'text' : 'markdown',
          content: String(explanation.content).slice(0, 5000),
        };
        if (q.context) existingQuestion.context = q.context;
        if (q.groupId) existingQuestion.groupId = q.groupId;
        
        await existingQuestion.save();
        questionIdsToUpdate.push(sanitizedId);
      } else {
        // Create new question with sanitized data
        questionDocs.push({
          id: sanitizedId,
          question: questionTextValidation.sanitized!,
          options: optionsValidation.sanitized!,
          correctIndex: q.correctIndex ?? 0,
          explanation: {
            format: explanation.format === 'text' ? 'text' : 'markdown',
            content: String(explanation.content).slice(0, 5000),
          },
          context: q.context,
          groupId: q.groupId,
        });
        newQuestionIds.push(sanitizedId);
      }
    }

    // Insert new questions
    let insertedQuestions = [];
    if (questionDocs.length > 0) {
      insertedQuestions = await Question.insertMany(questionDocs);
    }

    // Get all question IDs
    const allQuestionIds = [
      ...questionIdsToUpdate,
      ...newQuestionIds,
    ];

    // Remove questions that are no longer in the quiz
    const oldQuestionIds = quiz.questionIds;
    const questionsToRemove = oldQuestionIds.filter((id: string) => !allQuestionIds.includes(id));

    // Update quiz with sanitized data
    quiz.title = titleValidation.sanitized!;
    quiz.description = descValidation.sanitized || '';
    quiz.questionIds = allQuestionIds;
    await quiz.save();

    return NextResponse.json({
      success: true,
      quizId: quiz.quizId,
      title: quiz.title,
      questionCount: allQuestionIds.length,
      newQuestions: insertedQuestions.length,
      updatedQuestions: questionIdsToUpdate.length,
      removedQuestions: questionsToRemove.length,
    });
  } catch (error: any) {
    console.error('Error updating quiz:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update quiz' },
      { status: 500 }
    );
  }
}

// DELETE quiz
export async function DELETE(
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

    // Check if user is admin
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Forbidden: Only administrators can delete quizzes' },
        { status: 403 }
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

    await connectDB();

    // Find the quiz
    const quiz = await Quiz.findOne({ quizId: rawQuizId.trim() });
    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Check if there are any attempts for this quiz
    const attemptCount = await Attempt.countDocuments({ quizId: rawQuizId.trim() });
    
    // Delete the quiz
    await Quiz.deleteOne({ quizId: rawQuizId.trim() });

    // Optionally delete questions (only if not used by other quizzes)
    // For now, we'll keep questions in case they're used elsewhere
    // You can uncomment this if you want to delete questions too:
    // await Question.deleteMany({ id: { $in: quiz.questionIds } });

    return NextResponse.json({
      success: true,
      message: `Quiz "${quiz.title}" deleted successfully`,
      deletedQuizId: quiz.quizId,
      questionCount: quiz.questionIds.length,
      attemptCount, // Inform admin how many attempts were associated
    });
  } catch (error: any) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete quiz' },
      { status: 500 }
    );
  }
}

