/**
 * Security utilities for input validation and sanitization
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

// Maximum limits
export const MAX_QUIZ_TITLE_LENGTH = 200;
export const MAX_QUIZ_DESCRIPTION_LENGTH = 1000;
export const MAX_QUESTION_TEXT_LENGTH = 1000;
export const MAX_OPTION_LENGTH = 500;
export const MAX_QUESTIONS_PER_QUIZ = 500;
export const MAX_OPTIONS_PER_QUESTION = 10;
export const MAX_QUIZ_ID_LENGTH = 100;
export const MAX_QUESTION_ID_LENGTH = 100;
export const MAX_EXPLANATION_LENGTH = 5000;

/**
 * Validate quiz ID format
 * Allows: alphanumeric, hyphens, underscores
 */
export function validateQuizId(quizId: string): { valid: boolean; error?: string } {
  if (!quizId || typeof quizId !== 'string') {
    return { valid: false, error: 'Quiz ID is required' };
  }

  if (quizId.length > MAX_QUIZ_ID_LENGTH) {
    return { valid: false, error: `Quiz ID must be ${MAX_QUIZ_ID_LENGTH} characters or less` };
  }

  if (quizId.length < 1) {
    return { valid: false, error: 'Quiz ID cannot be empty' };
  }

  // Allow alphanumeric, hyphens, underscores, dots
  const validPattern = /^[a-zA-Z0-9._-]+$/;
  if (!validPattern.test(quizId)) {
    return { valid: false, error: 'Quiz ID can only contain letters, numbers, dots, hyphens, and underscores' };
  }

  return { valid: true };
}

/**
 * Validate question ID format
 */
export function validateQuestionId(questionId: string): { valid: boolean; error?: string } {
  if (!questionId || typeof questionId !== 'string') {
    return { valid: false, error: 'Question ID is required' };
  }

  if (questionId.length > MAX_QUESTION_ID_LENGTH) {
    return { valid: false, error: `Question ID must be ${MAX_QUESTION_ID_LENGTH} characters or less` };
  }

  if (questionId.trim().length === 0) {
    return { valid: false, error: 'Question ID cannot be empty' };
  }

  return { valid: true };
}

/**
 * Sanitize string input - remove dangerous characters and limit length
 */
export function sanitizeString(input: string, maxLength: number): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove null bytes and control characters (except newlines and tabs)
  let sanitized = input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim and limit length
  sanitized = sanitized.trim().slice(0, maxLength);
  
  return sanitized;
}

/**
 * Validate and sanitize quiz title
 */
export function validateQuizTitle(title: string): { valid: boolean; sanitized?: string; error?: string } {
  if (!title || typeof title !== 'string') {
    return { valid: false, error: 'Quiz title is required' };
  }

  const sanitized = sanitizeString(title, MAX_QUIZ_TITLE_LENGTH);
  
  if (sanitized.length === 0) {
    return { valid: false, error: 'Quiz title cannot be empty' };
  }

  return { valid: true, sanitized };
}

/**
 * Validate and sanitize quiz description
 */
export function validateQuizDescription(description: string | undefined): { valid: boolean; sanitized?: string } {
  if (!description) {
    return { valid: true, sanitized: '' };
  }

  if (typeof description !== 'string') {
    return { valid: false };
  }

  const sanitized = sanitizeString(description, MAX_QUIZ_DESCRIPTION_LENGTH);
  return { valid: true, sanitized };
}

/**
 * Validate question text
 */
export function validateQuestionText(question: string): { valid: boolean; sanitized?: string; error?: string } {
  if (!question || typeof question !== 'string') {
    return { valid: false, error: 'Question text is required' };
  }

  const sanitized = sanitizeString(question, MAX_QUESTION_TEXT_LENGTH);
  
  if (sanitized.length === 0) {
    return { valid: false, error: 'Question text cannot be empty' };
  }

  return { valid: true, sanitized };
}

/**
 * Validate options array
 */
export function validateOptions(options: any[]): { valid: boolean; sanitized?: string[]; error?: string } {
  if (!Array.isArray(options)) {
    return { valid: false, error: 'Options must be an array' };
  }

  if (options.length < 2) {
    return { valid: false, error: 'At least 2 options are required' };
  }

  if (options.length > MAX_OPTIONS_PER_QUESTION) {
    return { valid: false, error: `Maximum ${MAX_OPTIONS_PER_QUESTION} options allowed` };
  }

  const sanitized = options
    .filter(opt => opt !== null && opt !== undefined)
    .map(opt => sanitizeString(String(opt), MAX_OPTION_LENGTH))
    .filter(opt => opt.length > 0);

  if (sanitized.length < 2) {
    return { valid: false, error: 'At least 2 non-empty options are required' };
  }

  return { valid: true, sanitized };
}

/**
 * Validate correct index
 */
export function validateCorrectIndex(correctIndex: number, optionsLength: number): { valid: boolean; error?: string } {
  if (typeof correctIndex !== 'number' || isNaN(correctIndex)) {
    return { valid: false, error: 'Correct index must be a number' };
  }

  if (!Number.isInteger(correctIndex)) {
    return { valid: false, error: 'Correct index must be an integer' };
  }

  if (correctIndex < 0 || correctIndex >= optionsLength) {
    return { valid: false, error: `Correct index must be between 0 and ${optionsLength - 1}` };
  }

  return { valid: true };
}

/**
 * Validate questions array
 */
export function validateQuestionsArray(questions: any[]): { valid: boolean; error?: string } {
  if (!Array.isArray(questions)) {
    return { valid: false, error: 'Questions must be an array' };
  }

  if (questions.length === 0) {
    return { valid: false, error: 'At least one question is required' };
  }

  if (questions.length > MAX_QUESTIONS_PER_QUIZ) {
    return { valid: false, error: `Maximum ${MAX_QUESTIONS_PER_QUIZ} questions allowed per quiz` };
  }

  return { valid: true };
}

/**
 * Validate answer submission
 */
export function validateAnswerSubmission(
  answers: any,
  validQuestionIds: string[]
): { valid: boolean; sanitized?: Array<{ questionId: string; selectedIndex: number }>; error?: string } {
  if (!answers) {
    return { valid: false, error: 'Answers are required' };
  }

  let answersArray: Array<{ questionId: string; selectedIndex: number }> = [];

  if (Array.isArray(answers)) {
    if (answers.length > validQuestionIds.length) {
      return { valid: false, error: 'Too many answers submitted' };
    }

    answersArray = answers
      .filter((a: any) => a && typeof a === 'object' && a.questionId && typeof a.selectedIndex === 'number')
      .map((a: any) => ({
        questionId: String(a.questionId).trim(),
        selectedIndex: Number(a.selectedIndex),
      }))
      .filter((a: any) => 
        validQuestionIds.includes(a.questionId) && 
        !isNaN(a.selectedIndex) && 
        a.selectedIndex >= 0 && 
        a.selectedIndex < 4
      );
  } else if (typeof answers === 'object') {
    const entries = Object.entries(answers);
    if (entries.length > validQuestionIds.length) {
      return { valid: false, error: 'Too many answers submitted' };
    }

    answersArray = entries
      .map(([questionId, selectedIndex]) => ({
        questionId: String(questionId).trim(),
        selectedIndex: Number(selectedIndex),
      }))
      .filter((a: any) => 
        validQuestionIds.includes(a.questionId) && 
        !isNaN(a.selectedIndex) && 
        a.selectedIndex >= 0 && 
        a.selectedIndex < 4
      );
  } else {
    return { valid: false, error: 'Invalid answers format' };
  }

  // Remove duplicates
  const uniqueAnswers = Array.from(
    new Map(answersArray.map(a => [a.questionId, a])).values()
  );

  return { valid: true, sanitized: uniqueAnswers };
}

/**
 * Validate mode
 */
export function validateMode(mode: any): { valid: boolean; sanitized?: 'study' | 'exam'; error?: string } {
  if (mode === 'study' || mode === 'exam') {
    return { valid: true, sanitized: mode };
  }
  return { valid: false, error: 'Mode must be either "study" or "exam"' };
}

