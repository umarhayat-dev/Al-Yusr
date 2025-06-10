import * as admin from "firebase-admin";
import { z } from "zod";

// Schemas for data validation
export const enrollmentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  country: z.string().optional(),
  course: z.string().min(1),
  gender: z.string().optional(),
  notes: z.string().optional(),
  level: z.string().optional(),
  schedule: z.string().optional(),
  type: z.string().optional()
});

export const contactFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(1)
});

export const reviewSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  course: z.string().min(1),
  rating: z.union([z.string(), z.number()]),
  review: z.string().min(1)
});

export type EnrollmentData = z.infer<typeof enrollmentSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type ReviewData = z.infer<typeof reviewSchema>;

const database = admin.database();

export class FirebaseService {
  // Enrollment operations
  async createEnrollment(data: EnrollmentData) {
    try {
      const validatedData = enrollmentSchema.parse(data);
      
      const enrollmentData = {
        ...validatedData,
        fullName: `${validatedData.firstName} ${validatedData.lastName}`,
        status: "pending",
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const enrollmentRef = await database.ref('enrollments').push(enrollmentData);
      
      return {
        success: true,
        id: enrollmentRef.key,
        message: "Enrollment submitted successfully!"
      };
    } catch (error) {
      console.error("Error creating enrollment:", error);
      return {
        success: false,
        message: "Failed to submit enrollment",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async getEnrollments() {
    try {
      const snapshot = await database.ref('enrollments').once('value');
      const enrollments = snapshot.val() || {};
      
      return Object.entries(enrollments).map(([id, data]) => ({
        id,
        ...data as any
      }));
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      throw new Error("Failed to fetch enrollments");
    }
  }

  async updateEnrollmentStatus(id: string, status: string) {
    try {
      await database.ref(`enrollments/${id}`).update({
        status,
        updatedAt: new Date().toISOString()
      });
      
      return { success: true, message: "Enrollment status updated" };
    } catch (error) {
      console.error("Error updating enrollment:", error);
      return { success: false, message: "Failed to update enrollment" };
    }
  }

  // Contact form operations
  async createContactForm(data: ContactFormData) {
    try {
      const validatedData = contactFormSchema.parse(data);
      
      const contactData = {
        ...validatedData,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        status: "unread",
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const contactRef = await database.ref('contactForms').push(contactData);
      
      return {
        success: true,
        id: contactRef.key,
        message: "Contact form submitted successfully!"
      };
    } catch (error) {
      console.error("Error creating contact form:", error);
      return {
        success: false,
        message: "Failed to submit contact form",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async getContactForms() {
    try {
      const snapshot = await database.ref('contactForms').once('value');
      const contacts = snapshot.val() || {};
      
      return Object.entries(contacts).map(([id, data]) => ({
        id,
        ...data as any
      }));
    } catch (error) {
      console.error("Error fetching contact forms:", error);
      throw new Error("Failed to fetch contact forms");
    }
  }

  async updateContactStatus(id: string, status: string) {
    try {
      await database.ref(`contactForms/${id}`).update({
        status,
        updatedAt: new Date().toISOString()
      });
      
      return { success: true, message: "Contact status updated" };
    } catch (error) {
      console.error("Error updating contact:", error);
      return { success: false, message: "Failed to update contact" };
    }
  }

  // Review operations
  async createReview(data: ReviewData) {
    try {
      const validatedData = reviewSchema.parse(data);
      
      const reviewData = {
        ...validatedData,
        rating: Number(validatedData.rating),
        approved: false,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        status: "pending",
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const reviewRef = await database.ref('reviews').push(reviewData);
      
      return {
        success: true,
        id: reviewRef.key,
        message: "Review submitted successfully and pending approval!"
      };
    } catch (error) {
      console.error("Error creating review:", error);
      return {
        success: false,
        message: "Failed to submit review",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async getPendingReviews() {
    try {
      const snapshot = await database.ref('reviews')
        .orderByChild('approved')
        .equalTo(false)
        .once('value');
      
      const reviews = snapshot.val() || {};
      
      return Object.entries(reviews).map(([id, data]) => ({
        id,
        rowIndex: id, // For compatibility with existing admin interface
        ...data as any
      }));
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
      throw new Error("Failed to fetch pending reviews");
    }
  }

  async getApprovedReviews() {
    try {
      const snapshot = await database.ref('approvedReviews').once('value');
      const reviews = snapshot.val() || {};
      
      return Object.entries(reviews).map(([id, data]) => ({
        id: parseInt(id.split('_')[1]) || Math.random(), // For compatibility
        ...data as any
      }));
    } catch (error) {
      console.error("Error fetching approved reviews:", error);
      throw new Error("Failed to fetch approved reviews");
    }
  }

  async approveReview(reviewId: string) {
    try {
      // Get the review data
      const reviewSnapshot = await database.ref(`reviews/${reviewId}`).once('value');
      const reviewData = reviewSnapshot.val();
      
      if (!reviewData) {
        return { success: false, message: "Review not found" };
      }

      // Create approved review entry
      const approvedReviewData = {
        name: reviewData.name,
        course: reviewData.course,
        rating: reviewData.rating,
        review: reviewData.review,
        date: reviewData.date,
        timestamp: reviewData.timestamp
      };

      await database.ref('approvedReviews').push(approvedReviewData);
      
      // Update original review status
      await database.ref(`reviews/${reviewId}`).update({
        approved: true,
        status: "approved",
        updatedAt: new Date().toISOString()
      });
      
      return { success: true, message: "Review approved successfully" };
    } catch (error) {
      console.error("Error approving review:", error);
      return { success: false, message: "Failed to approve review" };
    }
  }

  async deleteReview(reviewId: string) {
    try {
      await database.ref(`reviews/${reviewId}`).remove();
      return { success: true, message: "Review deleted successfully" };
    } catch (error) {
      console.error("Error deleting review:", error);
      return { success: false, message: "Failed to delete review" };
    }
  }
}

export const firebaseService = new FirebaseService();