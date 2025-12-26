"use client";

import { useState, useEffect, useCallback } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUser, useOrganization } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { checkAdminStatus } from "@/lib/utils/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, Save, AlertCircle } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: {
    format: "markdown" | "text";
    content: string;
  };
  context?: string; // For passage text
  groupId?: string; // To link grouped questions
}

function CreateQuizPageInner() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editQuizId = searchParams.get("edit");
  const isEditMode = !!editQuizId;

  const [loading, setLoading] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizId, setQuizId] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (isLoaded && orgLoaded && user) {
      const adminStatus = checkAdminStatus({
        ...user,
        organizationMemberships: organization
          ? [{ organization: { id: organization.id } }]
          : user.organizationMemberships,
      });
      setIsAdmin(adminStatus);
      setCheckingAdmin(false);
    } else if (isLoaded && !isSignedIn) {
      setCheckingAdmin(false);
    }
  }, [isLoaded, isSignedIn, user, orgLoaded, organization]);

  // Load quiz data when in edit mode
  const loadQuizForEdit = useCallback(async (quizId: string) => {
    try {
      setLoadingQuiz(true);
      setError(null);
      const response = await fetch(`/api/admin/quizzes/${quizId}`);
      if (!response.ok) {
        throw new Error("Failed to load quiz");
      }
      const data = await response.json();
      setQuizId(data.quizId);
      setQuizTitle(data.title);
      setQuizDescription(data.description || "");
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quiz");
    } finally {
      setLoadingQuiz(false);
    }
  }, []);

  useEffect(() => {
    if (isEditMode && isAdmin && isLoaded && editQuizId) {
      loadQuizForEdit(editQuizId);
    }
  }, [isEditMode, isAdmin, isLoaded, editQuizId, loadQuizForEdit]);

  // Loading spinner remains
  if (!isLoaded || checkingAdmin || loadingQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect to /401 if not signed in
  if (!isSignedIn) {
    if (typeof window !== "undefined") {
      window.location.replace("/401");
    }
    return null;
  }

  // Redirect to /403 if not admin
  if (!isAdmin) {
    if (typeof window !== "undefined") {
      window.location.replace("/403");
    }
    return null;
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q${questions.length + 1}`,
      question: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      explanation: {
        format: "markdown",
        content: "",
      },
    };
    setQuestions([...questions, newQuestion]);
  };

  const addPassageGroup = () => {
    const groupId = `g-${Date.now()}`;
    const newQuestion: Question = {
      id: `q${questions.length + 1}`,
      question: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      explanation: {
        format: "markdown",
        content: "",
      },
      context: "",
      groupId,
      // isGrouped property is implied by having a groupId
    };
    setQuestions([...questions, newQuestion]);
  };

  const addQuestionToGroup = (groupId: string, context: string) => {
    const newQuestion: Question = {
      id: `q${questions.length + 1}`,
      question: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      explanation: {
        format: "markdown",
        content: "",
      },
      context,
      groupId,
    };
    // Insert after the last question of this group
    const lastGroupIndex = questions.findLastIndex(q => q.groupId === groupId);
    const updated = [...questions];
    updated.splice(lastGroupIndex + 1, 0, newQuestion);
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    if (field === "options") {
      updated[index].options = value;
    } else if (field === "explanation") {
      updated[index].explanation = value;
    } else {
      (updated[index] as any)[field] = value;
    }
    setQuestions(updated);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validation
    if (!quizTitle.trim()) {
      setError("Quiz title is required");
      setLoading(false);
      return;
    }

    if (!isEditMode && !quizId.trim()) {
      setError("Quiz ID is required (e.g., 'my-quiz')");
      setLoading(false);
      return;
    }

    if (questions.length === 0) {
      setError("At least one question is required");
      setLoading(false);
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`Question ${i + 1} is missing text`);
        setLoading(false);
        return;
      }
      if (q.options.filter((opt) => opt.trim()).length < 2) {
        setError(`Question ${i + 1} needs at least 2 options`);
        setLoading(false);
        return;
      }
      if (!q.explanation.content.trim()) {
        setError(`Question ${i + 1} is missing explanation`);
        setLoading(false);
        return;
      }
    }

    try {
      // Create or update quiz
      const url = isEditMode
        ? `/api/admin/quizzes/${editQuizId}`
        : "/api/admin/create-quiz";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId: quizId.trim(),
          title: quizTitle.trim(),
          description: quizDescription.trim(),
          questions: questions.map((q) => ({
            id: q.id,
            question: q.question.trim(),
            options: q.options.map((opt) => opt.trim()).filter((opt) => opt),
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            context: q.context,
            groupId: q.groupId,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || `Failed to ${isEditMode ? "update" : "create"} quiz`
        );
      }

      setSuccess(true);
      setTimeout(() => {
        if (isEditMode) {
          router.push("/admin/quizzes");
        } else {
          router.push(`/quiz/${quizId.trim()}`);
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl">
                  {isEditMode ? "Edit Quiz" : "Create New Quiz"}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {isEditMode
                    ? "Update quiz details, questions, and answers"
                    : "Add questions, answers, and explanations to create a new quiz"}
                </CardDescription>
              </div>
              <Link href="/admin/quizzes" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <span className="hidden sm:inline">
                    {isEditMode ? "Back to Quizzes" : "View All Quizzes"}
                  </span>
                  <span className="sm:hidden">
                    {isEditMode ? "Back" : "View All"}
                  </span>
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Quiz Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Quiz ID <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={quizId}
                    onChange={(e) => setQuizId(e.target.value)}
                    placeholder="e.g., my-quiz, math-test"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    required
                    disabled={isEditMode}
                    readOnly={isEditMode}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {isEditMode
                      ? "Quiz ID cannot be changed after creation"
                      : "Used in URL: /quiz/your-quiz-id"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Quiz Title <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="e.g., Math Practice Test"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Quiz Description
                  </label>
                  <textarea
                    value={quizDescription}
                    onChange={(e) => setQuizDescription(e.target.value)}
                    placeholder="Describe what this quiz covers..."
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  />
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Questions</h3>
                    <p className="text-sm text-muted-foreground">
                      {questions.length} question
                      {questions.length !== 1 ? "s" : ""} added
                    </p>
                  </div>
                  <div className="flex gap-2">
                     <Button
                       type="button"
                       onClick={addQuestion}
                       variant="outline"
                       size="sm"
                     >
                       <Plus className="w-4 h-4 mr-2" />
                       Add Single Question
                     </Button>
                     <Button
                       type="button"
                       onClick={addPassageGroup}
                       variant="outline"
                       size="sm"
                     >
                       <Plus className="w-4 h-4 mr-2" />
                       Add Passage Group
                     </Button>
                  </div>
                </div>

                {questions.map((question, qIndex) => {
                  const isGroupStart = question.groupId && (!questions[qIndex - 1] || questions[qIndex - 1].groupId !== question.groupId);
                  const isGrouped = !!question.groupId;
                  
                  return (
                  <div key={qIndex} className={isGrouped ? "pl-4 border-l-4 border-primary/20" : ""}>
                    {isGroupStart && (
                       <div className="mb-4 space-y-2">
                          <label className="text-sm font-medium block text-primary">
                             Passage / Context <span className="text-destructive">*</span>
                          </label>
                          <textarea
                             value={question.context}
                             onChange={(e) => {
                                // Update context for all questions in this group
                                const updated = questions.map(q => 
                                   q.groupId === question.groupId ? { ...q, context: e.target.value } : q
                                );
                                setQuestions(updated);
                             }}
                             placeholder="Enter the shared passage or context here..."
                             rows={4}
                             className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground shadow-sm"
                          />
                       </div>
                    )}
                    
                    <Card className="p-4 relative">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-medium">
                         {isGrouped 
                            ? `Question ${qIndex + 1} (Part of Group)` 
                            : `Question ${qIndex + 1}`}
                      </h4>
                      <div className="flex gap-2">
                      {isGroupStart && (
                         <Button
                            type="button"
                            onClick={() => addQuestionToGroup(question.groupId!, question.context || "")}
                            variant="secondary"
                            size="sm"
                            className="text-xs"
                         >
                            <Plus className="w-3 h-3 mr-1" />
                            Add to Group
                         </Button>
                      )}
                      {!isGrouped && (
                        <Button
                          type="button"
                          onClick={() => {
                            const newGroupId = `g-${Date.now()}`;
                            const updated = [...questions];
                            updated[qIndex].groupId = newGroupId;
                            updated[qIndex].context = "";
                            setQuestions(updated);
                          }}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Passage
                        </Button>
                      )}
                      
                        <Button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Question Text{" "}
                          <span className="text-destructive">*</span>
                        </label>
                        <textarea
                          value={question.question}
                          onChange={(e) =>
                            updateQuestion(qIndex, "question", e.target.value)
                          }
                          placeholder="Enter your question here..."
                          rows={2}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Options <span className="text-destructive">*</span>
                        </label>
                        {question.options.map((option, oIndex) => (
                          <div
                            key={oIndex}
                            className="flex items-center gap-2 mb-2"
                          >
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={question.correctIndex === oIndex}
                              onChange={() =>
                                updateQuestion(qIndex, "correctIndex", oIndex)
                              }
                              className="w-4 h-4"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) =>
                                updateOption(qIndex, oIndex, e.target.value)
                              }
                              placeholder={`Option ${oIndex + 1}`}
                              className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                            />
                          </div>
                        ))}
                        <p className="text-xs text-muted-foreground mt-2">
                          Select the radio button next to the correct answer
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Explanation{" "}
                          <span className="text-destructive">*</span>
                        </label>
                        <textarea
                          value={question.explanation.content}
                          onChange={(e) =>
                            updateQuestion(qIndex, "explanation", {
                              ...question.explanation,
                              content: e.target.value,
                            })
                          }
                          placeholder="Explain why this answer is correct..."
                          rows={3}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                          required
                        />
                      </div>
                    </div>
                  </Card>
                  </div>
                );
                })}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>
                    Quiz {isEditMode ? "updated" : "created"} successfully!
                    Redirecting...
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditMode ? "Update Quiz" : "Create Quiz"}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CreateQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CreateQuizPageInner />
    </Suspense>
  );
}
