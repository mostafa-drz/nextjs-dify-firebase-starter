import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/utils/firebase-admin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

/**
 * DELETE /api/auth/delete-account
 * Permanently deletes a user account and all associated data
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check if Firebase Admin is initialized
    if (!adminDb || !adminAuth) {
      return NextResponse.json(
        { message: 'Firebase Admin not initialized. Please check environment variables.' },
        { status: 500 }
      );
    }

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Start a batch write for atomic operations
    const batch = adminDb.batch();

    try {
      // Delete user's conversations
      const conversationsSnapshot = await adminDb
        .collection('conversations')
        .where('userId', '==', userId)
        .get();

      conversationsSnapshot.docs.forEach((doc: QueryDocumentSnapshot) => {
        batch.delete(doc.ref);
      });

      // Delete user's credit history
      const creditHistorySnapshot = await adminDb
        .collection('creditHistory')
        .where('userId', '==', userId)
        .get();

      creditHistorySnapshot.docs.forEach((doc: QueryDocumentSnapshot) => {
        batch.delete(doc.ref);
      });

      // Delete user's profile data
      const userProfileRef = adminDb.collection('users').doc(userId);
      batch.delete(userProfileRef);

      // Delete user's preferences
      const userPreferencesRef = adminDb.collection('userPreferences').doc(userId);
      batch.delete(userPreferencesRef);

      // Commit all deletions atomically
      await batch.commit();

      // Delete the Firebase Auth user
      await adminAuth.deleteUser(userId);
      
      return NextResponse.json(
        { 
          message: 'Account and all associated data deleted successfully',
          deletedCollections: [
            'conversations',
            'creditHistory', 
            'users',
            'userPreferences'
          ]
        },
        { status: 200 }
      );

    } catch (firestoreError) {
      console.error('Firestore deletion error:', firestoreError);
      return NextResponse.json(
        { message: 'Failed to delete user data from database' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
