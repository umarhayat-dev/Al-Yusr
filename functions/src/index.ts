import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";

// Initialize Firebase Admin
admin.initializeApp();

const app = express();

// Configure CORS for production deployment
const corsOptions = {
  origin: [
    "https://alyusrinstitute-net.web.app",
    "https://alyusrinstitute-net.firebaseapp.com",
    "http://localhost:5173", // for local development
    "http://localhost:5000"  // for local development
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Import storage and schemas
import { storage } from "./storage";
import { insertBookingSchema, insertReviewSchema } from "./shared/schema";
import { z } from "zod";
import { google } from "googleapis";
import { serviceAccountKey } from "./sheetsConfig";
import { submitFormToFirebase } from "./formSubmission";
import { firebaseService } from "./firebaseService";

// Routes implementation
app.get("/api/courses", async (req, res) => {
  try {
    const courses = await storage.getAllCourses();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses" });
  }
});

app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await storage.getActiveReviews();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

app.get("/api/google-sheets-reviews", async (req, res) => {
  console.log("Fetching Google Sheets reviews...");
  try {
    const GOOGLE_SHEETS_CONFIG = {
      API_KEY: "AIzaSyB-m6oYsSta-KEweNeUSY04TTZadEINemE",
      SPREADSHEET_ID: "1zy8Qs2K8DCM6N0OdSJHV7n1fkbvjhGZkwWQOSsfvStc",
      SHEET_NAME: "Sheet1",
    };

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.SHEET_NAME}?key=${GOOGLE_SHEETS_CONFIG.API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.values) {
      return res.json([]);
    }

    const headers = data.values[0];
    const rows = data.values.slice(1);
    
    const approvedReviews = rows
      .filter((row: any[]) => row[0]?.toLowerCase() === "yes")
      .map((row: any[], index: number) => {
        const review: any = {};
        headers.forEach((header: string, idx: number) => {
          review[header.toLowerCase().replace(/\s+/g, '')] = row[idx] || '';
        });
        review.id = index + 2;
        return review;
      });

    res.json(approvedReviews);
  } catch (error) {
    console.error("Error fetching Google Sheets reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews from Google Sheets" });
  }
});

app.post("/api/bookings", async (req, res) => {
  try {
    const booking = insertBookingSchema.parse(req.body);
    const newBooking = await storage.createBooking(booking);
    res.status(201).json(newBooking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid booking data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to create booking" });
    }
  }
});

app.post("/api/reviews", async (req, res) => {
  try {
    const review = insertReviewSchema.parse(req.body);
    const newReview = await storage.createReview(review);
    res.status(201).json(newReview);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid review data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to create review" });
    }
  }
});

// Submit enrollment to Firebase RTDB (replaces Google Sheets)
app.post("/api/submit-enrollment", async (req, res) => {
  try {
    console.log("Submitting enrollment to Firebase RTDB...");
    const result = await firebaseService.createEnrollment(req.body);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error submitting enrollment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit enrollment"
    });
  }
});

// Legacy Google Sheets enrollment endpoint (maintained for compatibility)
app.post("/api/submit-enrollment-to-sheets", async (req, res) => {
  try {
    console.log("Submitting enrollment to Google Sheets...");
    const {
      firstName,
      lastName,
      email,
      gender,
      phone,
      country,
      course,
      level,
      schedule,
      notes,
      type,
    } = req.body;

    if (!firstName || !lastName || !email || !course) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, email, and course are required",
      });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const ENROLLMENT_SHEET_CONFIG = {
      SPREADSHEET_ID: "130ylkBnXiIoei-p8UDpJGSRzoo72l5TVFZkMoKELBi8",
      SHEET_NAME: "Sheet1",
    };

    const timestamp = new Date().toISOString();
    const rowData = new Array(28).fill("");

    rowData[0] = timestamp;
    rowData[1] = email;
    rowData[2] = `${firstName} ${lastName}`;
    rowData[3] = phone;
    rowData[4] = country;
    rowData[5] = course;
    rowData[6] = gender;
    rowData[7] = notes || "";
    rowData[8] = level;
    rowData[9] = schedule;

    const values = [rowData];

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: ENROLLMENT_SHEET_CONFIG.SPREADSHEET_ID,
      range: `${ENROLLMENT_SHEET_CONFIG.SHEET_NAME}!A:AB`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values },
    });

    console.log("Enrollment submitted successfully to Google Sheets:", result.data.updates);

    res.json({
      success: true,
      message: "Enrollment submitted successfully!",
      sheetsResult: result.data.updates,
    });
  } catch (error) {
    console.error("Error submitting enrollment to Google Sheets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit enrollment",
      details: (error as Error).message,
    });
  }
});

// Submit contact form to Google Sheets
app.post("/api/submit-contact-to-sheets", async (req, res) => {
  console.log("Submitting contact form to Google Sheets...");
  try {
    const { name, email, phone, subject, message } = req.body;

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ["https://www.googleapis.com/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const CONTACT_SHEET_CONFIG = {
      SPREADSHEET_ID: "1zy8Qs2K8DCM6N0OdSJHV7n1fkbvjhGZkwWQOSsfvStc",
      SHEET_NAME: "ContactForms",
    };

    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    const values = [
      [currentDate, currentTime, name, email, phone || "", subject, message],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: CONTACT_SHEET_CONFIG.SPREADSHEET_ID,
      range: `${CONTACT_SHEET_CONFIG.SHEET_NAME}!A:G`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: values,
      },
    });

    console.log("Contact form submitted successfully to Google Sheets");
    res.json({
      success: true,
      message: "Contact form submitted successfully!",
    });
  } catch (error) {
    console.error("Error submitting contact form to Google Sheets:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to submit contact form" 
    });
  }
});

// Submit review to Google Sheets
app.post("/api/submit-review-to-sheets", async (req, res) => {
  console.log("Submitting review to Google Sheets...");
  try {
    const { name, email, course, rating, review } = req.body;

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const REVIEW_SHEET_CONFIG = {
      SPREADSHEET_ID: "1zy8Qs2K8DCM6N0OdSJHV7n1fkbvjhGZkwWQOSsfvStc",
      SHEET_NAME: "Sheet1",
    };

    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    const values = [
      ["No", currentDate, currentTime, name, email, course, rating, review],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: REVIEW_SHEET_CONFIG.SPREADSHEET_ID,
      range: `${REVIEW_SHEET_CONFIG.SHEET_NAME}!A:H`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: values,
      },
    });

    console.log("Review submitted successfully to Google Sheets");
    res.json({
      success: true,
      message: "Review submitted successfully and pending approval!",
    });
  } catch (error) {
    console.error("Error submitting review to Google Sheets:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to submit review" 
    });
  }
});

// Admin route to get pending reviews
app.get("/api/admin/pending-reviews", async (req, res) => {
  console.log("Fetching pending reviews from Google Sheets...");
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: "1zy8Qs2K8DCM6N0OdSJHV7n1fkbvjhGZkwWQOSsfvStc",
      range: "Sheet1!A:H",
    });

    console.log("Google Sheets response received");
    const rows = response.data.values || [];
    console.log(`Found rows: ${rows.length}`);

    if (rows.length <= 1) {
      return res.json([]);
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    const pendingReviews = dataRows
      .map((row, index) => ({
        rowIndex: index + 2,
        approved: row[0] || "",
        date: row[1] || "",
        time: row[2] || "",
        name: row[3] || "",
        email: row[4] || "",
        course: row[5] || "",
        rating: row[6] || "",
        review: row[7] || "",
      }))
      .filter(review => review.approved.toLowerCase() === "no");

    console.log(`Pending reviews found: ${pendingReviews.length}`);
    res.json(pendingReviews);
  } catch (error) {
    console.error("Error fetching pending reviews:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch pending reviews" 
    });
  }
});

// Admin route to delete review
app.delete("/api/admin/delete-review/:rowIndex", async (req, res) => {
  const { rowIndex } = req.params;
  console.log(`Deleting row: ${rowIndex}`);
  
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1zy8Qs2K8DCM6N0OdSJHV7n1fkbvjhGZkwWQOSsfvStc";

    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
    });

    console.log("Available sheets:", spreadsheet.data.sheets?.map(s => s.properties?.title));

    const sheetId = spreadsheet.data.sheets?.[0]?.properties?.sheetId;
    console.log("Using sheetId:", sheetId);

    if (sheetId === undefined) {
      throw new Error("Sheet ID not found");
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: "ROWS",
                startIndex: parseInt(rowIndex) - 1,
                endIndex: parseInt(rowIndex),
              },
            },
          },
        ],
      },
    });

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
});

// Firebase form submission endpoint
app.post("/api/submit-form", submitFormToFirebase);

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  console.error(err);
});

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app);