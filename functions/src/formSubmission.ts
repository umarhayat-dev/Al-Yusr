import { Request, Response } from "express";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { serviceAccountKey } from "./sheetsConfig";

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccountKey as any),
    databaseURL: "https://alyusrinstitute-net-default-rtdb.firebaseio.com/"
  });
}

const db = getDatabase();

interface FormSubmissionRequest {
  formType: string;
  data: any;
}

export const submitFormToFirebase = async (req: Request, res: Response) => {
  try {
    const { formType, data }: FormSubmissionRequest = req.body;

    if (!formType || !data) {
      return res.status(400).json({
        success: false,
        message: "Missing formType or data"
      });
    }

    // Prepare submission data
    const submissionData = {
      ...data,
      approved: false,
      timestamp: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
    };

    // Submit to Firebase Realtime Database
    const formsRef = db.ref(`forms/${formType}`);
    const newEntryRef = await formsRef.push(submissionData);

    console.log(`Form submitted to Firebase: ${formType}, ID: ${newEntryRef.key}`);

    res.json({
      success: true,
      message: "Form submitted successfully!",
      id: newEntryRef.key
    });

  } catch (error: any) {
    console.error("Firebase submission error:", error);
    res.status(500).json({
      success: false,
      message: "Submission failed. Please try again later."
    });
  }
};