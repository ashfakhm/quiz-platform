import mongoose, { Schema, Document } from "mongoose";

export interface IQuiz extends Document {
  quizId: string;
  title: string;
  description?: string;
  questionIds: string[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema = new Schema<IQuiz>(
  {
    quizId: {
      type: String,
      required: true,
      unique: true,
      // unique: true automatically creates an index, so we don't need index: true
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    questionIds: {
      type: [String],
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: "General",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation during development
export const Quiz =
  mongoose.models.Quiz || mongoose.model<IQuiz>("Quiz", QuizSchema);
