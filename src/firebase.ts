import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, query, onSnapshot, getDocFromServer, FirestoreError } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Connection test with retry logic
async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      // Use getDocFromServer to force a network request
      await getDocFromServer(doc(db, 'test', 'connection'));
      console.log("Firebase connection successful.");
      return;
    } catch (error) {
      const err = error as FirestoreError;
      if (err.code === 'unavailable' || (err.message && err.message.includes('offline'))) {
        console.warn(`Firebase connection attempt ${i + 1} failed. Retrying...`);
        if (i === retries - 1) {
          console.error("Firebase connection error: Could not reach Firestore backend. Please check your internet connection or Firebase configuration.");
        }
        // Wait 2 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        // Other errors (like permission denied) mean we ARE connected but just can't read this specific doc
        console.log("Firebase connected (received response from server).");
        return;
      }
    }
  }
}

// Delay initial test to allow network to stabilize
setTimeout(() => testConnection(), 3000);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
