// Admin configuration - shared constants
// SECURITY WARNING: Never expose user IDs in client-side code or public repositories
// For production, use Clerk Organizations instead (see admin-server.ts)

export const ADMIN_USER_IDS = [
  // Add your Clerk user IDs here
  // Example: 'user_2abc123...'
  // Get your user ID from Clerk dashboard or from the user object
];

export const ADMIN_EMAILS = [
  // Add admin emails here
  // Example: 'admin@example.com'
  'muhammednawaf.buissness@gmail.com', // Temporary admin - migrate to Clerk Organizations
];

/**
 * Check admin status for client components
 * Pass the user object from useUser() hook
 * 
 * Note: For production, prefer server-side checks using Clerk Organizations
 * This client-side check is a fallback and should not be the only security measure
 */
export function checkAdminStatus(
  user: { 
    id?: string; 
    emailAddresses?: Array<{ emailAddress?: string }>;
    organizationMemberships?: Array<{ organization: { id: string } }>;
  } | null
): boolean {
  if (!user) return false;

  // Method 1: Check Clerk Organization membership (if available)
  const adminOrgId = process.env.NEXT_PUBLIC_CLERK_ADMIN_ORG_ID;
  if (adminOrgId && user.organizationMemberships) {
    const isAdminOrgMember = user.organizationMemberships.some(
      membership => membership.organization.id === adminOrgId
    );
    if (isAdminOrgMember) {
      return true;
    }
  }

  // Method 2: Fallback - Check by user ID (development only)
  if (user.id && ADMIN_USER_IDS.includes(user.id)) {
    return true;
  }

  // Method 3: Fallback - Check by email (development only)
  if (user.emailAddresses) {
    const emails = user.emailAddresses.map(e => e.emailAddress).filter(Boolean) as string[];
    return emails.some(email => ADMIN_EMAILS.includes(email));
  }

  return false;
}

