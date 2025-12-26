/**
 * Seed script to populate the database with initial quiz data
 * Run with: npx tsx scripts/seed-database.ts
 * Or: npm run seed (if added to package.json)
 * 
 * NOTE: This file is excluded from Next.js build via tsconfig.json
 */


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - This file is not part of the Next.js build
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local file from project root (two levels up from scripts/)
const envPath = resolve(__dirname, '..', '.env.local');
console.log(`Loading environment from: ${envPath}`);
config({ path: envPath });
import mongoose from 'mongoose';
import { Question } from '../src/lib/models/Question.js';
import { Quiz } from '../src/lib/models/Quiz.js';
import { mockQuestions } from '../src/lib/mock-data.js';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  process.exit(1);
}

async function createQuizWithQuestions(
  quizId: string,
  title: string,
  description: string,
  baseQuestions: typeof mockQuestions
) {
  console.log(`\n📦 Seeding Quiz: ${quizId}...`);

  // 1. Create unique questions for this quiz
  // We prefix the question ID with the quiz ID to ensure global uniqueness
  const scopedQuestions = baseQuestions.map((q) => ({
    ...q,
    id: `${quizId}_${q.id}`, // e.g., 'nism-practice_q1'
    _id: undefined, // Let MongoDB generate a fresh _id
  }));

  // 2. Insert questions
  const insertedDocs = await Question.insertMany(scopedQuestions);
  const questionIds = insertedDocs.map((q) => q.id);
  console.log(`   ✅ Inserted ${insertedDocs.length} questions (Scoped IDs like '${quizId}_q1')`);

  // 3. Create or Update Quiz
  let quiz = await Quiz.findOne({ quizId });
  if (quiz) {
    quiz.questionIds = questionIds;
    quiz.title = title;
    quiz.description = description;
    await quiz.save();
    console.log(`   ✅ Updated quiz metadata`);
  } else {
    quiz = new Quiz({
      quizId,
      title,
      description,
      questionIds,
    });
    await quiz.save();
    console.log(`   ✅ Created new quiz`);
  }
}

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected to MongoDB');

    // Clear existing data to ensure a clean state
    console.log('🧹 Clearing all existing questions and quizzes...');
    await Question.deleteMany({});
    await Quiz.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create Main Quiz
    await createQuizWithQuestions(
      'nism-practice',
      'NISM Series Investment Advisor Practice Test',
      '50 questions covering investment advisory concepts, regulations, and best practices',
      mockQuestions
    );

    // Create a Copy to verify isolation (Optional, but good for verification)
    await createQuizWithQuestions(
      'financial-planning-basics',
      'Financial Planning Basics',
      'A simplified subset of questions for beginners.',
      mockQuestions.slice(0, 10) // Just the first 10 for this different quiz
    );

    console.log('\n🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedDatabase();

