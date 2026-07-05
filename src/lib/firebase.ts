/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { CampaignPreset, UTMTemplate, HistoryLog, ShortenerSettings } from "../types";
import { encryptSettings, decryptSettings } from "./encryption";
import localFirebaseConfig from "../../firebase-applet-config.json";

// Construct the configuration, prioritizing environment variables (e.g. in GitHub Actions / production deploy)
// over the local firebase-applet-config.json file which is not committed to Git.
const isCustomProject = !!import.meta.env.VITE_FIREBASE_PROJECT_ID && import.meta.env.VITE_FIREBASE_PROJECT_ID !== localFirebaseConfig.projectId;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localFirebaseConfig.apiKey || "dummy-api-key-for-local-development",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localFirebaseConfig.authDomain || "dummy-project-id.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || localFirebaseConfig.projectId || "dummy-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || localFirebaseConfig.storageBucket || "dummy-project-id.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localFirebaseConfig.messagingSenderId || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || localFirebaseConfig.appId || "1:1234567890:web:abcdef123456",
  firestoreDatabaseId: isCustomProject 
    ? (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || undefined)
    : (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || (localFirebaseConfig as any).firestoreDatabaseId || undefined),
};

// Check if we are running with dummy/placeholder config (e.g., when built on GitHub without custom secrets)
export const isUsingDummyConfig = 
  !firebaseConfig.apiKey || 
  firebaseConfig.apiKey.includes("dummy") || 
  firebaseConfig.projectId.includes("dummy") ||
  firebaseConfig.apiKey === "";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
// Pass firestoreDatabaseId (if specified) as the second argument to target the specific database
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();

// Google Sign In
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    throw error;
  }
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};

// Load all user data from Firestore
export const getUserData = async (userId: string) => {
  try {
    // 1. Load Settings
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    let settings: ShortenerSettings | null = null;
    if (userDoc.exists()) {
      const rawSettings = userDoc.data().shortenerSettings || null;
      if (rawSettings) {
        settings = decryptSettings(rawSettings, userId);
      }
    }

    // 2. Load Presets
    const presetsCol = collection(db, "users", userId, "presets");
    const presetsSnapshot = await getDocs(presetsCol);
    const presets: CampaignPreset[] = presetsSnapshot.docs.map((d) => d.data() as CampaignPreset);

    // 3. Load Templates
    const templatesCol = collection(db, "users", userId, "templates");
    const templatesSnapshot = await getDocs(templatesCol);
    const templates: UTMTemplate[] = templatesSnapshot.docs.map((d) => d.data() as UTMTemplate);

    // 4. Load History Logs
    const historyCol = collection(db, "users", userId, "history");
    const historySnapshot = await getDocs(historyCol);
    const historyLogs: HistoryLog[] = historySnapshot.docs.map((d) => d.data() as HistoryLog);

    return {
      settings,
      presets,
      templates,
      historyLogs,
    };
  } catch (error) {
    console.error("Error fetching user data from Firestore:", error);
    throw error;
  }
};

// Save Shortener Settings
export const saveUserShortenerSettings = async (userId: string, settings: ShortenerSettings) => {
  try {
    const encrypted = encryptSettings(settings, userId);
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, { shortenerSettings: encrypted, updatedAt: new Date() }, { merge: true });
  } catch (error) {
    console.error("Error saving shortener settings to Firestore:", error);
    throw error;
  }
};

// Save Preset
export const saveUserPreset = async (userId: string, preset: CampaignPreset) => {
  try {
    const presetDocRef = doc(db, "users", userId, "presets", preset.id);
    await setDoc(presetDocRef, preset);
  } catch (error) {
    console.error("Error saving preset to Firestore:", error);
    throw error;
  }
};

// Delete Preset
export const deleteUserPreset = async (userId: string, presetId: string) => {
  try {
    const presetDocRef = doc(db, "users", userId, "presets", presetId);
    await deleteDoc(presetDocRef);
  } catch (error) {
    console.error("Error deleting preset from Firestore:", error);
    throw error;
  }
};

// Save Template
export const saveUserTemplate = async (userId: string, template: UTMTemplate) => {
  try {
    const templateDocRef = doc(db, "users", userId, "templates", template.id);
    await setDoc(templateDocRef, template);
  } catch (error) {
    console.error("Error saving template to Firestore:", error);
    throw error;
  }
};

// Delete Template
export const deleteUserTemplate = async (userId: string, templateId: string) => {
  try {
    const templateDocRef = doc(db, "users", userId, "templates", templateId);
    await deleteDoc(templateDocRef);
  } catch (error) {
    console.error("Error deleting template from Firestore:", error);
    throw error;
  }
};

// Save History Log
export const saveUserHistoryLog = async (userId: string, log: HistoryLog) => {
  try {
    const logDocRef = doc(db, "users", userId, "history", log.id);
    await setDoc(logDocRef, log);
  } catch (error) {
    console.error("Error saving history log to Firestore:", error);
    throw error;
  }
};

// Delete History Log
export const deleteUserHistoryLog = async (userId: string, logId: string) => {
  try {
    const logDocRef = doc(db, "users", userId, "history", logId);
    await deleteDoc(logDocRef);
  } catch (error) {
    console.error("Error deleting history log from Firestore:", error);
    throw error;
  }
};

// Clear All History Logs
export const clearUserHistoryLogs = async (userId: string, logIds: string[]) => {
  try {
    const batch = writeBatch(db);
    logIds.forEach((id) => {
      const ref = doc(db, "users", userId, "history", id);
      batch.delete(ref);
    });
    await batch.commit();
  } catch (error) {
    console.error("Error clearing user history logs:", error);
    throw error;
  }
};
