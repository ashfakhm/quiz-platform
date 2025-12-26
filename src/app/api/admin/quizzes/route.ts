/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import { Quiz } from '@/lib/models/Quiz';
import { isAdmin } from '@/lib/utils/admin-server';

// GET all quizzes (admin only)
export async function GET(_request: NextRequest) {
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
        { error: 'Forbidden: Only administrators can view quizzes' },
        { status: 403 }
      );
    }

    await connectDB();

    // Fetch all quizzes
    const quizzes = await Quiz.find({})
      .sort({ createdAt: -1 })
      .lean();

    const formattedQuizzes = quizzes.map((quiz) => ({
      quizId: quiz.quizId,
      title: quiz.title,
      description: quiz.description || '',
      questionCount: quiz.questionIds.length,
      createdAt: quiz.createdAt instanceof Date 
        ? quiz.createdAt.toISOString() 
        : new Date(quiz.createdAt).toISOString(),
      updatedAt: quiz.updatedAt instanceof Date 
        ? quiz.updatedAt.toISOString() 
        : new Date(quiz.updatedAt).toISOString(),
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

