import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { ADMIN_USER_IDS, ADMIN_EMAILS } from './admin';

// Clerk Organization ID for admins
// Create an organization in Clerk Dashboard and set the ID here
const ADMIN_ORGANIZATION_ID = process.env.CLERK_ADMIN_ORGANIZATION_ID || '';

/**
 * Check if the current user is an admin (server-side only)
 * Uses Clerk Organizations (recommended) or fallback to email/user ID list
 * @returns Promise<boolean> - true if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId) {
      return false;
    }

    // Method 1: Check Clerk Organization (Recommended for production)
    // If user is in the admin organization, grant access
    if (ADMIN_ORGANIZATION_ID && orgId === ADMIN_ORGANIZATION_ID) {
      return true;
    }

    // Method 2: Check organization membership via Clerk API
    // This allows checking if user belongs to admin org even if orgId is not in session
    if (ADMIN_ORGANIZATION_ID) {
      try {
        const client = await clerkClient();
        const memberships = await client.users.getOrganizationMembershipList({
          userId,
          limit: 100,
        });

        // Check if user is member of admin organization
        const isAdminOrgMember = memberships.data.some(
          (membership) => membership.organization.id === ADMIN_ORGANIZATION_ID
        );
        
        if (isAdminOrgMember) {
          return true;
        }
      } catch (error) {
        console.warn('Could not check organization membership:', error);
      }
    }

    // Method 3: Fallback - Check by user ID (for development/testing)
    if (ADMIN_USER_IDS.includes(userId)) {
      return true;
    }

    // Method 4: Fallback - Check by email (for development/testing)
    try {
      const user = await currentUser();
      if (user?.emailAddresses) {
        const emails = user.emailAddresses.map(e => e.emailAddress).filter(Boolean) as string[];
        if (emails.some(email => ADMIN_EMAILS.includes(email))) {
          return true;
        }
      }
    } catch (error) {
      // If we can't fetch user, continue with other checks
      console.warn('Could not fetch user for admin check:', error);
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

