/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import { Attempt } from '@/lib/models/Attempt';
import { Quiz } from '@/lib/models/Quiz';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: authUserId } = await auth();
    const { userId } = await params;

    // Verify the user is requesting their own history
    if (!authUserId || authUserId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      await connectDB();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Fetch user's attempts, sorted by most recent first
    const attempts = await Attempt.find({ userId })
      .sort({ completedAt: -1 })
      .limit(50) // Limit to last 50 attempts
      .lean();

    // Filter out attempts for quizzes that have been deleted
    const quizIds = [...new Set(attempts.map((a: any) => a.quizId))];
    const existingQuizzes = await Quiz.find({ quizId: { $in: quizIds } })
      .select('quizId')
      .lean();
    
    const existingQuizIds = new Set(existingQuizzes.map((q: any) => q.quizId));
    
    // Only keep attempts where the quiz still exists
    const validAttempts = attempts.filter((attempt: any) => existingQuizIds.has(attempt.quizId));

    // Format response
    const formattedAttempts = validAttempts.map((attempt) => ({
      attemptId: attempt.attemptId,
      quizId: attempt.quizId,
      quizTitle: attempt.quizTitle,
      mode: attempt.mode,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      completedAt: attempt.completedAt instanceof Date 
        ? attempt.completedAt.toISOString() 
        : new Date(attempt.completedAt).toISOString(),
    }));

    return NextResponse.json({
      attempts: formattedAttempts,
    });
  } catch (error: any) {
    console.error('Error fetching user history:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch user history',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

