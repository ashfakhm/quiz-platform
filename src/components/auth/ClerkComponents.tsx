'use client';


import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser, useOrganization } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { checkAdminStatus } from '@/lib/utils/admin';
import { Settings, LayoutDashboard } from 'lucide-react';

export default function ClerkComponents() {
  const { user, isLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const isAdmin = isLoaded && orgLoaded && user ? checkAdminStatus({
    ...user,
    organizationMemberships: organization 
      ? [{ organization: { id: organization.id } }]
      : user.organizationMemberships,
  }) : false;

  return (
    <>
      <SignedIn>
        {isAdmin && (
          <Link href="/admin/quizzes">
            <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3 text-xs sm:text-sm">
              <Settings className="h-3.5 w-3.5 sm:hidden" />
              <span className="hidden sm:inline">Manage Quizzes</span>
            </Button>
          </Link>
        )}
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="h-8 px-2 sm:px-3 text-xs sm:text-sm">
            <LayoutDashboard className="h-3.5 w-3.5 sm:hidden" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
        </Link>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="ghost" size="sm" className="h-8 px-2 sm:px-3 text-xs sm:text-sm">
            Sign In
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  );
}
