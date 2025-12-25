// API Client for Quiz Platform
import type { QuizResponse, AttemptSubmission, AttemptSummary, ApiError } from './types';
import { getMockQuizResponse } from './mock-data';

// Use mock data only if explicitly enabled via environment variable
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      }));
      throw new Error(error.message);
    }

    return response.json();
  }

  async fetchQuestions(quizId: string): Promise<QuizResponse> {
    if (USE_MOCK) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      return getMockQuizResponse(quizId);
    }
    return this.request<QuizResponse>(`/api/quiz/${quizId}/questions`);
  }

  async submitAttempt(data: AttemptSubmission): Promise<{ attemptId: string; saved: boolean }> {
    if (USE_MOCK) {
      // Simulate network delay and return mock response
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        attemptId: `attempt-${Date.now()}`,
        saved: true,
      };
    }
    return this.request(`/api/quiz/${data.quizId}/attempt`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserHistory(userId: string): Promise<{ attempts: AttemptSummary[] }> {
    if (USE_MOCK) {
      // Return empty history for mock
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { attempts: [] };
    }
    return this.request(`/api/user/${userId}/history`);
  }
}

export const apiClient = new ApiClient();
