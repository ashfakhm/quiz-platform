import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: {
    format: 'markdown' | 'text';
    content: string;
  };
}

const QuestionSchema = new Schema<IQuestion>({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (options: string[]) => options.length >= 2,
      message: 'Question must have at least 2 options',
    },
  },
  correctIndex: {
    type: Number,
    required: true,
    min: 0,
  },
  explanation: {
    format: {
      type: String,
      enum: ['markdown', 'text'],
      default: 'markdown',
    },
    content: {
      type: String,
      required: true,
    },
  },
});

// Prevent re-compilation during development
export const Question = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);

