'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export default function ClerkComponents() {
  return (
    <>
      <SignedIn>
        <Link href="/dashboard">
          <Button variant="ghost">Dashboard</Button>
        </Link>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="ghost">Sign In</Button>
        </SignInButton>
      </SignedOut>
    </>
  );
}
