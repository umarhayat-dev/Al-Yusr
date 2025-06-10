// firebaseAdmin.ts
import admin from "firebase-admin";
import { firebaseServiceAccountKey } from "../firebaseConfig";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseServiceAccountKey as admin.ServiceAccount),
    databaseURL: "https://alyusrinstitute-net-default-rtdb.firebaseio.com/"
  });
}

export const database = admin.database();

// Function to submit form data to Firebase Realtime Database
export async function submitFormToFirebase(
  formType: string,
  data: any
): Promise<{ success: boolean; message: string; id?: string }> {
  try {
    const submissionData = {
      ...data,
      approved: false,
      timestamp: admin.database.ServerValue.TIMESTAMP,
      submittedAt: new Date().toISOString(),
    };

    const formsRef = database.ref(`forms/${formType}`);
    const newEntryRef = await formsRef.push(submissionData);

    console.log(`✅ Form submitted to Firebase: ${formType}, ID: ${newEntryRef.key}`);

    return {
      success: true,
      message: "Form submitted successfully!",
      id: newEntryRef.key || undefined
    };

  } catch (error: any) {
    console.error("🔥 Firebase submission error:", error);
    return {
      success: false,
      message: "Submission failed. Please try again later."
    };
  }
}
