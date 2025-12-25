import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Quiz } from '@/lib/models/Quiz';

// GET all quizzes (public - for users to see available quizzes)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Fetch all quizzes
    const quizzes = await Quiz.find({})
      .sort({ createdAt: -1 })
      .select('quizId title description questionIds')
      .lean();

    const formattedQuizzes = quizzes.map((quiz) => ({
      quizId: quiz.quizId,
      title: quiz.title,
      description: quiz.description || '',
      questionCount: quiz.questionIds.length,
    }));

    return NextResponse.json({
      quizzes: formattedQuizzes,
    });
  } catch (error: any) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}

