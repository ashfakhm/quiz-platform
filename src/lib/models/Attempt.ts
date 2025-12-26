import mongoose, { Schema, Document } from 'mongoose';

export interface IAttempt extends Document {
  attemptId: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  mode: 'study' | 'exam';
  answers: Array<{
    questionId: string;
    selectedIndex: number;
    isCorrect: boolean;
  }>;
  score: number;
  totalQuestions: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AttemptSchema = new Schema<IAttempt>(
  {
    attemptId: {
      type: String,
      required: true,
      unique: true,
      // unique: true automatically creates an index
    },
    userId: {
      type: String,
      required: true,
      // Index created below in compound index
    },
    quizId: {
      type: String,
      required: true,
      // Index created below
    },
    quizTitle: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ['study', 'exam'],
      required: true,
    },
    answers: [
      {
        questionId: String,
        selectedIndex: Number,
        isCorrect: Boolean,
      },
    ],
    score: {
      type: Number,
      required: true,
      // Removed min: 0 to allow negative marking
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    completedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient queries
AttemptSchema.index({ userId: 1, completedAt: -1 });
AttemptSchema.index({ quizId: 1 });

// Prevent re-compilation during development
export const Attempt = mongoose.models.Attempt || mongoose.model<IAttempt>('Attempt', AttemptSchema);

