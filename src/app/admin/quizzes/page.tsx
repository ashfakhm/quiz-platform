"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface Quiz {
  quizId: string;
  title: string;
  description: string;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function QuizzesManagementPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

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

  useEffect(() => {
    if (isAdmin && isLoaded) {
      fetchQuizzes();
    }
  }, [isAdmin, isLoaded]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/quizzes");
      if (!response.ok) {
        throw new Error("Failed to fetch quizzes");
      }
      const data = await response.json();
      setQuizzes(data.quizzes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (quizId: string, title: string) => {
    setQuizToDelete({ id: quizId, title });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!quizToDelete) return;

    try {
      setDeletingQuizId(quizToDelete.id);
      setDeleteDialogOpen(false);
      const response = await fetch(`/api/admin/quizzes/${quizToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete quiz");
      }

      // Refresh quiz list
      await fetchQuizzes();
      setQuizToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete quiz");
      setQuizToDelete(null);
    } finally {
      setDeletingQuizId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setQuizToDelete(null);
  };

  // Redirect using router.replace for client navigation
  useEffect(() => {
    if (!isLoaded || checkingAdmin) return;
    if (!isSignedIn) {
      router.replace("/401");
    } else if (!isAdmin) {
      router.replace("/403");
    }
  }, [isLoaded, checkingAdmin, isSignedIn, isAdmin, router]);

  if (!isLoaded || checkingAdmin || !isSignedIn || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-sm">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
              Quiz Management
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Create, edit, and manage quizzes
            </p>
          </div>
          <Link href="/admin/create-quiz" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Create New Quiz</span>
              <span className="sm:hidden">New Quiz</span>
            </Button>
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : quizzes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No quizzes found.</p>
              <Link href="/admin/create-quiz">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Quiz
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Quiz List */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Card
                key={quiz.quizId}
                className="hover:shadow-lg transition-shadow flex flex-col h-full"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="line-clamp-2 text-base sm:text-lg">
                    {quiz.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs sm:text-sm mt-1">
                    {quiz.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 pt-0">
                  <div className="flex-1 space-y-2 sm:space-y-4">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      <p>{quiz.questionCount} questions</p>
                      <p className="truncate">
                        Updated: {new Date(quiz.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-stretch mt-4 pt-4 border-t border-border">
                    <Link
                      href={`/admin/create-quiz?edit=${quiz.quizId}`}
                      className="flex-1 flex"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center justify-center text-xs sm:text-sm"
                      >
                        <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(quiz.quizId, quiz.title)}
                      disabled={deletingQuizId === quiz.quizId}
                      className="flex-1 flex items-center justify-center text-xs sm:text-sm"
                    >
                      {deletingQuizId === quiz.quizId ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2 animate-spin" />
                          <span className="hidden sm:inline">Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Delete</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                <span>Delete Quiz</span>
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base wrap-break-word">
                Are you sure you want to delete &quot;{quizToDelete?.title}
                &quot;? This action cannot be undone and all associated data
                will be permanently removed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={handleDeleteCancel}
                disabled={deletingQuizId !== null}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deletingQuizId !== null}
                className="w-full sm:w-auto"
              >
                {deletingQuizId ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
