import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";
import { submitFormToFirebase, database } from "./firebaseAdmin"; // Firebase admin form submission function
import { firebaseService } from "./firebaseService";

export async function registerRoutes(app: Express): Promise<Server> {
  // === STORAGE-BASED ROUTES (Keep as is) ===

  // Get all courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Debug endpoint to see all reviews in Firebase
  app.get("/api/debug/all-reviews", async (req, res) => {
    try {
      const snapshot = await database.ref('forms/reviews').once('value');
      const allReviews = snapshot.val() || {};
      res.json(allReviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all reviews", error: error.message });
    }
  });

  // Get approved reviews from Firebase RTDB
  app.get("/api/reviews", async (req, res) => {
    try {
      const reviews = await firebaseService.getApprovedReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Create new review (pending approval)
  app.post("/api/reviews", async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview({
        ...validatedData,
        isActive: false, // New reviews need approval
      });
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Get single course
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      const course = await storage.getCourse(id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Create booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const course = await storage.getCourse(validatedData.courseId);
      if (!course) {
        return res.status(400).json({ message: "Course not found" });
      }
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Get all bookings
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // === FIREBASE REALTIME DATABASE ROUTES ===

  // Demo booking form submission 
  app.post("/api/submit-book-demo", async (req, res) => {
    try {
      const result = await firebaseService.createBookDemo(req.body);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error submitting demo booking:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit demo booking"
      });
    }
  });

  // Get all demo bookings (admin only)
  app.get("/api/book-demos", async (req, res) => {
    try {
      const demos = await firebaseService.getBookDemos();
      res.json(demos);
    } catch (error) {
      console.error("Error fetching demo bookings:", error);
      res.status(500).json({ message: "Failed to fetch demo bookings" });
    }
  });

  // Enrollment form submission (replaces Google Sheets)
  app.post("/api/submit-enrollment", async (req, res) => {
    try {
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

  // Get all enrollments (admin only)
  app.get("/api/enrollments", async (req, res) => {
    try {
      const enrollments = await firebaseService.getEnrollments();
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Update enrollment status (admin only)
  app.patch("/api/enrollments/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const result = await firebaseService.updateEnrollmentStatus(id, status);
      res.json(result);
    } catch (error) {
      console.error("Error updating enrollment:", error);
      res.status(500).json({ message: "Failed to update enrollment" });
    }
  });

  // Contact form submission (replaces Google Sheets)
  app.post("/api/submit-contact", async (req, res) => {
    try {
      const result = await firebaseService.createContactForm(req.body);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit contact form"
      });
    }
  });

  // Get all contact forms (admin only)
  app.get("/api/contact-forms", async (req, res) => {
    try {
      const contacts = await firebaseService.getContactForms();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contact forms:", error);
      res.status(500).json({ message: "Failed to fetch contact forms" });
    }
  });

  // Update contact form status (admin only)
  app.patch("/api/contact-forms/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const result = await firebaseService.updateContactStatus(id, status);
      res.json(result);
    } catch (error) {
      console.error("Error updating contact:", error);
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  // Review submission (replaces Google Sheets)
  app.post("/api/submit-review", async (req, res) => {
    try {
      const result = await firebaseService.createReview(req.body);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit review"
      });
    }
  });

  // Get approved reviews (public endpoint, replaces Google Sheets)
  app.get("/api/approved-reviews", async (req, res) => {
    try {
      const reviews = await firebaseService.getApprovedReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching approved reviews:", error);
      res.status(500).json({ message: "Failed to fetch approved reviews" });
    }
  });

  // Get pending reviews (admin only, replaces Google Sheets)
  app.get("/api/admin/pending-reviews", async (req, res) => {
    try {
      const reviews = await firebaseService.getPendingReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch pending reviews" 
      });
    }
  });

  // Approve review (admin only, replaces Google Sheets)
  app.post("/api/admin/approve-review/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await firebaseService.approveReview(id);
      res.json(result);
    } catch (error) {
      console.error("Error approving review:", error);
      res.status(500).json({
        success: false,
        message: "Failed to approve review"
      });
    }
  });

  // Delete review (admin only, replaces Google Sheets)
  app.delete("/api/admin/delete-review/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await firebaseService.deleteReview(id);
      res.json(result);
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete review"
      });
    }
  });

  // Free consultation form submission
  app.post("/api/submit-consultation", async (req, res) => {
    try {
      const result = await firebaseService.createFreeConsultation(req.body);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error submitting consultation:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit consultation request"
      });
    }
  });

  // Proposed role form submission
  app.post("/api/submit-role", async (req, res) => {
    try {
      const result = await firebaseService.createProposedRole(req.body);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error submitting role proposal:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit role proposal"
      });
    }
  });

  // Newsletter subscription
  app.post("/api/submit-newsletter", async (req, res) => {
    try {
      const result = await firebaseService.createNewsletterSubscription(req.body);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error submitting newsletter subscription:", error);
      res.status(500).json({
        success: false,
        message: "Failed to subscribe to newsletter"
      });
    }
  });

  // === ADMIN DASHBOARD API ENDPOINTS ===

  // Admin - Get all pending reviews for approval
  app.get("/api/admin/reviews/pending", async (req, res) => {
    try {
      const reviews = await firebaseService.getPendingReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending reviews" });
    }
  });

  // Admin - Approve review
  app.post("/api/admin/reviews/:id/approve", async (req, res) => {
    try {
      const result = await firebaseService.approveReview(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve review" });
    }
  });

  // Admin - Delete/Reject review
  app.delete("/api/admin/reviews/:id", async (req, res) => {
    try {
      const result = await firebaseService.deleteReview(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // Admin - Get all form submissions by type
  app.get("/api/admin/forms/contact", async (req, res) => {
    try {
      const forms = await firebaseService.getContactForms();
      res.json(forms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact forms" });
    }
  });

  app.get("/api/admin/forms/consultations", async (req, res) => {
    try {
      const consultations = await firebaseService.getFreeConsultations();
      res.json(consultations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch consultations" });
    }
  });

  app.get("/api/admin/forms/demos", async (req, res) => {
    try {
      const demos = await firebaseService.getEnrollments();
      res.json(demos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch demo requests" });
    }
  });

  app.get("/api/admin/forms/newsletter", async (req, res) => {
    try {
      const subscribers = await firebaseService.getNewsletterSubscribers();
      res.json(subscribers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch newsletter subscribers" });
    }
  });

  app.get("/api/admin/forms/roles", async (req, res) => {
    try {
      const roles = await firebaseService.getProposedRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch proposed roles" });
    }
  });

  app.get("/api/admin/donations", async (req, res) => {
    try {
      const donations = await firebaseService.getDonations();
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donations" });
    }
  });

  // Public testimonies endpoint (only approved reviews)
  app.get("/api/testimonies", async (req, res) => {
    try {
      const snapshot = await database.ref('testimonies')
        .orderByChild('active')
        .equalTo(true)
        .once('value');
      
      const testimonies = snapshot.val() || {};
      const testimonyList = Object.values(testimonies);
      
      res.json(testimonyList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch testimonies" });
    }
  });

  // Get users from Firebase RTDB for authentication
  app.get("/api/get-users", async (req, res) => {
    try {
      const snapshot = await database.ref('users').once('value');
      const users = snapshot.val() || {};
      const usersList = Object.keys(users).map(key => ({
        id: key,
        ...users[key]
      }));
      
      res.json(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch users" 
      });
    }
  });

  // Get active students from Firebase RTDB
  app.get("/api/active-students", async (req, res) => {
    try {
      const snapshot = await database.ref('active-students').once('value');
      const students = snapshot.val() || {};
      const studentsList = Object.keys(students).map(key => ({
        id: key,
        ...students[key]
      }));
      
      res.json(studentsList);
    } catch (error) {
      console.error("Error fetching active students:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch active students" 
      });
    }
  });

  // Get courses from Firebase RTDB
  app.get("/api/firebase-courses", async (req, res) => {
    try {
      const snapshot = await database.ref('courses').once('value');
      const courses = snapshot.val() || {};
      const coursesList = Object.keys(courses).map(key => ({
        id: key,
        ...courses[key]
      }));
      
      res.json(coursesList);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch courses" 
      });
    }
  });

  // Get teacher data from Firebase RTDB
  app.get("/api/teachers", async (req, res) => {
    try {
      const snapshot = await database.ref('teacher').once('value');
      const teachers = snapshot.val() || {};
      const teachersList = Object.keys(teachers).map(key => ({
        id: key,
        ...teachers[key]
      }));
      
      res.json(teachersList);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch teachers" 
      });
    }
  });

  // Create user in Firebase RTDB
  app.post("/api/create-user", async (req, res) => {
    try {
      const { email, password, role, name } = req.body;
      
      if (!email || !password || !role || !name) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: email, password, role, name"
        });
      }

      const userRef = database.ref('users').push();
      const userData = {
        email,
        password,
        role,
        name,
        active: true,
        createdAt: new Date().toISOString()
      };
      
      await userRef.set(userData);
      
      res.json({
        success: true,
        id: userRef.key,
        message: "User created successfully"
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create user"
      });
    }
  });

  // Donation submission endpoint
  app.post("/api/submit-donation", async (req, res) => {
    try {
      const result = await firebaseService.createDonation(req.body);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error submitting donation:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit donation request"
      });
    }
  });

  // Legacy endpoints for backward compatibility
  app.get("/api/consultations", async (req, res) => {
    try {
      const consultations = await firebaseService.getFreeConsultations();
      res.json(consultations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch consultations" });
    }
  });

  app.get("/api/proposed-roles", async (req, res) => {
    try {
      const roles = await firebaseService.getProposedRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch proposed roles" });
    }
  });

  app.get("/api/newsletter-subscribers", async (req, res) => {
    try {
      const subscribers = await firebaseService.getNewsletterSubscribers();
      res.json(subscribers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch newsletter subscribers" });
    }
  });

  // === LEGACY FIREBASE FORM SUBMISSION (Generic) ===
  app.post("/api/submit-form", async (req, res) => {
    try {
      const { formType, data } = req.body;

      if (!formType || !data) {
        return res.status(400).json({ success: false, message: "Missing formType or data" });
      }

      const result = await submitFormToFirebase(formType, data);

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error("Firebase form submission error:", error);
      res.status(500).json({
        success: false,
        message: "Submission failed. Please try again later."
      });
    }
  });

  // Helper routes for specific forms for clarity and validation
  // These call the generic submit-form or directly submitFormToFirebase function

  app.post("/api/submit-contact", async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body;
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }
      const result = await submitFormToFirebase("contactMessages", {
        name, email, phone: phone || "", subject, message
      });
      if (!result.success) throw new Error(result.message);
      res.json({ success: true, message: "Contact form submitted successfully", id: result.id });
    } catch (e: any) {
      console.error("Contact submission error:", e);
      res.status(500).json({ success: false, message: e.message || "Failed to submit contact form" });
    }
  });

  app.post("/api/submit-enrollment", async (req, res) => {
    try {
      const {
        firstName, lastName, email, gender, phone, country,
        course, level, schedule, notes, type
      } = req.body;
      if (!firstName || !lastName || !email || !course) {
        return res.status(400).json({ success: false, message: "Missing required enrollment fields" });
      }
      const enrollmentData = {
        firstName, lastName, email, gender: gender || "", phone: phone || "",
        country: country || "", course, level: level || "", schedule: schedule || "",
        notes: notes || "", type: type || ""
      };
      const result = await submitFormToFirebase("enrollments", enrollmentData);
      if (!result.success) throw new Error(result.message);
      res.json({ success: true, message: "Enrollment submitted successfully", id: result.id });
    } catch (e: any) {
      console.error("Enrollment submission error:", e);
      res.status(500).json({ success: false, message: e.message || "Failed to submit enrollment" });
    }
  });

  app.post("/api/submit-demo", async (req, res) => {
    try {
      const {
        firstName, lastName, email, phone, country, course,
        gender, notes, level, schedule
      } = req.body;
      if (!firstName || !lastName || !email || !course) {
        return res.status(400).json({ success: false, message: "Missing required fields for demo form" });
      }
      const fullName = `${firstName} ${lastName}`;
      const demoData = {
        firstName, lastName, email, phone, country, course,
        gender: gender || "", notes: notes || "", level: level || "", schedule: schedule || "", fullName
      };
      const result = await submitFormToFirebase("demoForms", demoData);
      if (!result.success) throw new Error(result.message);
      res.json({ success: true, message: "Demo form submitted successfully", id: result.id });
    } catch (e: any) {
      console.error("Demo submission error:", e);
      res.status(500).json({ success: false, message: e.message || "Failed to submit demo form" });
    }
  });

  app.post("/api/submit-newsletter", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }
      const result = await submitFormToFirebase("newsletterSubscribers", { email });
      if (!result.success) throw new Error(result.message);
      res.json({ success: true, message: "Newsletter subscribed successfully", id: result.id });
    } catch (e: any) {
      console.error("Newsletter submission error:", e);
      res.status(500).json({ success: false, message: e.message || "Failed to subscribe newsletter" });
    }
  });

  app.post("/api/submit-teacher-note", async (req, res) => {
    try {
      const { teacherSerial, studentSerial, note } = req.body;
      if (!teacherSerial || !teacherSerial.startsWith("TE") || !studentSerial || !note) {
        return res.status(403).json({ error: "Invalid or missing teacherSerial, studentSerial or note" });
      }
      const result = await submitFormToFirebase("teacherNotes", { teacherSerial, studentSerial, note });
      if (!result.success) throw new Error(result.message);
      res.json({ success: true, message: "Teacher note submitted successfully", id: result.id });
    } catch (e: any) {
      console.error("Teacher note submission error:", e);
      res.status(500).json({ success: false, message: e.message || "Failed to submit teacher note" });
    }
  });

  app.post("/api/submit-review", async (req, res) => {
    try {
      const { name, email, location, rating, comment } = req.body;
      if (!name || !location || !rating || !comment) {
        return res.status(400).json({ error: "Missing required review fields" });
      }
      const reviewData = {
        name, email: email || "", location, rating, comment, approved: false,
        submittedAt: new Date().toISOString()
      };
      const result = await submitFormToFirebase("reviews", reviewData);
      if (!result.success) throw new Error(result.message);
      res.json({ success: true, message: "Review submitted successfully and pending approval", id: result.id });
    } catch (e: any) {
      console.error("Review submission error:", e);
      res.status(500).json({ success: false, message: e.message || "Failed to submit review" });
    }
  });

  // === LEGACY GOOGLE SHEETS READ ROUTES (consider migrating to Firebase) ===
  // You can keep these temporarily if you still want to fetch from Sheets
  // Revisit these later for migration or removal

  // Get teachers and students from Google Sheets
  app.get("/api/sheets/teachers-students", async (req, res) => {
    res.status(501).json({ message: "Deprecated - migrate to Firebase and remove" });
  });

  // Google Sheets data endpoints
  app.get("/api/sheets/students", async (req, res) => {
    res.status(501).json({ message: "Deprecated - migrate to Firebase and remove" });
  });

  app.get("/api/sheets/teachers", async (req, res) => {
    res.status(501).json({ message: "Deprecated - migrate to Firebase and remove" });
  });

  app.get("/api/sheets/courses", async (req, res) => {
    res.status(501).json({ message: "Deprecated - migrate to Firebase and remove" });
  });

  // Admin routes for review approval, deletion now deprecated
  app.get("/api/admin/pending-reviews", (req, res) => {
    res.status(501).json({ message: "Deprecated - migrate to Firebase and remove" });
  });

  app.post("/api/admin/approve-review/:rowIndex", (req, res) => {
    res.status(501).json({ message: "Deprecated - migrate to Firebase and remove" });
  });

  app.delete("/api/admin/delete-review/:rowIndex", (req, res) => {
    res.status(501).json({ message: "Deprecated - migrate to Firebase and remove" });
  });

  // Teacher notes also deprecated
  app.get("/api/teacher-notes/:teacherSerial", (req, res) => {
    res.status(501).json({ message: "Deprecated - migrate to Firebase and remove" });
  });

  const httpServer = createServer(app);
  return httpServer;
}


