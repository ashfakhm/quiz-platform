/**
 * Seed script to populate the database with initial quiz data
 * Run with: npx tsx scripts/seed-database.ts
 * Or: npm run seed (if added to package.json)
 */

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

const MONGODB_URI: string | undefined = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  process.exit(1);
}

// At this point, TypeScript knows MONGODB_URI is string (not undefined)
const mongoUri: string = MONGODB_URI;

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing questions and quizzes...');
    await Question.deleteMany({});
    await Quiz.deleteMany({});
    console.log('✅ Cleared existing data');

    // Insert questions
    console.log(`📝 Inserting ${mockQuestions.length} questions...`);
    const questionDocs = await Question.insertMany(mockQuestions);
    console.log(`✅ Inserted ${questionDocs.length} questions`);

    // Create quiz with all question IDs
    const questionIds = questionDocs.map((q) => q.id);
    
    // Check if quiz already exists
    let quiz = await Quiz.findOne({ quizId: 'nism-practice' });
    if (quiz) {
      quiz.questionIds = questionIds;
      quiz.title = 'NISM Series Investment Advisor Practice Test';
      quiz.description = '50 questions covering investment advisory concepts, regulations, and best practices';
      await quiz.save();
      console.log('✅ Updated existing quiz: nism-practice');
    } else {
      quiz = new Quiz({
        quizId: 'nism-practice',
        title: 'NISM Series Investment Advisor Practice Test',
        description: '50 questions covering investment advisory concepts, regulations, and best practices',
        questionIds,
      });
      await quiz.save();
      console.log('✅ Created quiz: nism-practice');
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log(`   - ${questionDocs.length} questions inserted`);
    console.log(`   - 1 quiz created (ID: nism-practice)`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedDatabase();

