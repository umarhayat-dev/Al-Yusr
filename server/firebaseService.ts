import { database } from "./firebaseAdmin";
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
  course: z.string().optional(),
  rating: z.union([z.string(), z.number()]),
  review: z.string().min(1)
});

export const freeConsultationSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  currentSituation: z.enum(["Student", "Working Professional", "Stay-at-home Parent", "Retired", "Unemployed", "Other"]),
  challenges: z.string().min(10, "Please describe your challenges (minimum 10 characters)"),
  goals: z.string().min(10, "Please describe your goals (minimum 10 characters)"),
  learningPreference: z.enum(["One-on-one", "Small groups", "Self-paced", "Structured classes"]),
  knowledgeLevel: z.enum(["Beginner", "Some knowledge", "Intermediate", "Advanced"]),
  preferredDateTime: z.string().min(1, "Preferred consultation time is required"),
  specificQuestions: z.string().optional(),
  howDidYouHear: z.enum(["Social Media", "Friend/Family", "Google Search", "Islamic Center", "Other"]),
});

export const proposedRoleSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  roleTitle: z.string().min(1),
  portfolioLink: z.string().optional(),
  whyJoin: z.string().min(1),
  additionalNotes: z.string().optional()
});

export const newsletterSchema = z.object({
  email: z.string().email()
});

export const bookDemoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  preferredCourse: z.string().min(1, "Please select a course"),
  preferredDateTime: z.string().min(1, "Preferred date/time is required"),
  experienceLevel: z.enum(["Beginner", "Some knowledge", "Intermediate", "Advanced"]),
});

export const donationSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  amount: z.number().min(1, "Donation amount must be greater than 0"),
  message: z.string().optional(),
  isAnonymous: z.boolean().optional(),
});

export type EnrollmentData = z.infer<typeof enrollmentSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type ReviewData = z.infer<typeof reviewSchema>;
export type BookDemoData = z.infer<typeof bookDemoSchema>;
export type FreeConsultationData = z.infer<typeof freeConsultationSchema>;
export type ProposedRoleData = z.infer<typeof proposedRoleSchema>;
export type NewsletterData = z.infer<typeof newsletterSchema>;
export type DonationData = z.infer<typeof donationSchema>;

export class FirebaseService {
  // Enrollment operations
  async createEnrollment(data: EnrollmentData) {
    try {
      const validatedData = enrollmentSchema.parse(data);
      
      const enrollmentData = {
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        email: validatedData.email,
        phone: validatedData.phone || "",
        course: validatedData.course,
        level: validatedData.level || "",
        schedule: validatedData.schedule || "",
        notes: validatedData.notes || "",
        submittedAt: new Date().toISOString()
      };

      const enrollmentRef = await database.ref('forms/bookDemos').push(enrollmentData);
      
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
      const snapshot = await database.ref('forms/bookDemos').once('value');
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
      await database.ref(`forms/bookDemos/${id}`).update({
        status,
        updatedAt: new Date().toISOString()
      });
      
      return { success: true, message: "Enrollment status updated" };
    } catch (error) {
      console.error("Error updating enrollment:", error);
      return { success: false, message: "Failed to update enrollment" };
    }
  }

  // Demo booking operations
  async createBookDemo(data: BookDemoData) {
    try {
      const validatedData = bookDemoSchema.parse(data);
      
      const demoData = {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        preferredCourse: validatedData.preferredCourse,
        preferredDateTime: validatedData.preferredDateTime,
        experienceLevel: validatedData.experienceLevel,
        status: "pending",
        submittedAt: new Date().toISOString()
      };

      const demoRef = await database.ref('bookdemo').push(demoData);
      
      return {
        success: true,
        id: demoRef.key,
        message: "Demo booking submitted successfully! We'll contact you to confirm your session."
      };
    } catch (error) {
      console.error("Error creating demo booking:", error);
      return {
        success: false,
        message: "Failed to submit demo booking",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async getBookDemos() {
    try {
      const snapshot = await database.ref('bookdemo').once('value');
      const demos = snapshot.val() || {};
      
      return Object.entries(demos).map(([id, data]) => ({
        id,
        ...data as any
      }));
    } catch (error) {
      console.error("Error fetching demo bookings:", error);
      throw new Error("Failed to fetch demo bookings");
    }
  }

  // Contact form operations
  async createContactForm(data: ContactFormData) {
    try {
      const validatedData = contactFormSchema.parse(data);
      
      const contactData = {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || "",
        subject: validatedData.subject,
        message: validatedData.message,
        submittedAt: new Date().toISOString()
      };

      const contactRef = await database.ref('forms/contact').push(contactData);
      
      return {
        success: true,
        id: contactRef.key,
        message: "Thank you! Your message has been sent successfully. We'll get back to you soon."
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
      const snapshot = await database.ref('forms/contact').once('value');
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
      await database.ref(`forms/contact/${id}`).update({
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
        active: false, // Not active until approved
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        status: "pending",
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const reviewRef = await database.ref('forms/reviews').push(reviewData);
      
      return {
        success: true,
        id: reviewRef.key,
        message: "Thank you for your review! It's pending approval and will appear publicly once approved."
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
      const snapshot = await database.ref('forms/reviews')
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
      // Get all reviews first, then filter appropriately
      const snapshot = await database.ref('forms/reviews').once('value');
      const allReviews = snapshot.val() || {};
      
      // Filter reviews to show:
      // 1. New reviews: approved === true AND active === true
      // 2. Imported reviews: active === true (these don't have approved field)
      // 3. Imported reviews that should be public: missing approved field but have content
      return Object.entries(allReviews)
        .filter(([id, data]: [string, any]) => {
          // New review system: must be explicitly approved and active
          if (data.approved === true && data.active === true) {
            return true;
          }
          
          // Imported reviews: show if they have active: true OR if they're missing approved field (imported from old system)
          if (data.approved === undefined) {
            // For imported reviews, show if active is true OR missing (default to show)
            return data.active !== false && data.name && data.testimony;
          }
          
          return false;
        })
        .map(([id, data]) => ({
          id,
          name: data.name,
          email: data.email || "",
          location: data.residence || data.location || "",
          rating: data.rating || 5,
          comment: data.testimony || data.comment || "",
          timestamp: data.timestamp,
          active: data.active,
          approved: data.approved,
          ...data as any
        }));
    } catch (error) {
      console.error("Error fetching approved reviews:", error);
      throw new Error("Failed to fetch approved reviews");
    }
  }

  async approveReview(reviewId: string) {
    try {
      // Update review status in forms/reviews
      await database.ref(`forms/reviews/${reviewId}`).update({
        approved: true,
        active: true,
        status: "approved",
        approvedAt: new Date().toISOString(),
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
      await database.ref(`forms/reviews/${reviewId}`).remove();
      return { success: true, message: "Review deleted successfully" };
    } catch (error) {
      console.error("Error deleting review:", error);
      return { success: false, message: "Failed to delete review" };
    }
  }

  // Free consultation operations
  async createFreeConsultation(data: FreeConsultationData) {
    try {
      const validatedData = freeConsultationSchema.parse(data);
      
      const consultationData = {
        fullName: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        currentSituation: validatedData.currentSituation,
        challenges: validatedData.challenges,
        goals: validatedData.goals,
        learningPreference: validatedData.learningPreference,
        knowledgeLevel: validatedData.knowledgeLevel,
        preferredDateTime: validatedData.preferredDateTime,
        specificQuestions: validatedData.specificQuestions || "",
        howDidYouHear: validatedData.howDidYouHear,
        submittedAt: new Date().toISOString()
      };

      const consultationRef = await database.ref('forms/consultations').push(consultationData);
      
      return {
        success: true,
        id: consultationRef.key,
        message: "Consultation request submitted! Our counselor will reach out within 24 hours."
      };
    } catch (error) {
      console.error("Error creating free consultation:", error);
      return {
        success: false,
        message: "Failed to submit consultation request",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  // Proposed role operations
  async createProposedRole(data: ProposedRoleData) {
    try {
      const validatedData = proposedRoleSchema.parse(data);
      
      const roleData = {
        name: validatedData.name,
        email: validatedData.email,
        roleTitle: validatedData.roleTitle,
        portfolioLink: validatedData.portfolioLink || "",
        whyJoin: validatedData.whyJoin,
        additionalNotes: validatedData.additionalNotes || "",
        submittedAt: new Date().toISOString()
      };

      const roleRef = await database.ref('forms/roles').push(roleData);
      
      return {
        success: true,
        id: roleRef.key,
        message: "Role proposal submitted successfully!"
      };
    } catch (error) {
      console.error("Error creating proposed role:", error);
      return {
        success: false,
        message: "Failed to submit role proposal",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  // Newsletter subscription operations with duplicate email check
  async createNewsletterSubscription(data: NewsletterData) {
    try {
      const validatedData = newsletterSchema.parse(data);
      
      // Check for existing email
      const existingSnapshot = await database.ref('forms/newsletter')
        .orderByChild('email')
        .equalTo(validatedData.email)
        .once('value');
      
      if (existingSnapshot.exists()) {
        return {
          success: false,
          message: "You're already subscribed to our newsletter!"
        };
      }
      
      const subscriptionData = {
        email: validatedData.email,
        submittedAt: new Date().toISOString()
      };

      const subscriptionRef = await database.ref('forms/newsletter').push(subscriptionData);
      
      return {
        success: true,
        id: subscriptionRef.key,
        message: "Successfully subscribed to our newsletter!"
      };
    } catch (error) {
      console.error("Error creating newsletter subscription:", error);
      return {
        success: false,
        message: "Failed to subscribe to newsletter",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  // Admin methods to get form submissions
  async getFreeConsultations() {
    try {
      const snapshot = await database.ref('forms/consultations').once('value');
      const consultations = snapshot.val() || {};
      
      return Object.entries(consultations).map(([id, data]) => ({
        id,
        ...data as any
      }));
    } catch (error) {
      console.error("Error fetching consultations:", error);
      throw new Error("Failed to fetch consultations");
    }
  }

  async getProposedRoles() {
    try {
      const snapshot = await database.ref('forms/roles').once('value');
      const roles = snapshot.val() || {};
      
      return Object.entries(roles).map(([id, data]) => ({
        id,
        ...data as any
      }));
    } catch (error) {
      console.error("Error fetching proposed roles:", error);
      throw new Error("Failed to fetch proposed roles");
    }
  }

  async getNewsletterSubscribers() {
    try {
      const snapshot = await database.ref('forms/newsletter').once('value');
      const subscribers = snapshot.val() || {};
      
      return Object.entries(subscribers).map(([id, data]) => ({
        id,
        ...data as any
      }));
    } catch (error) {
      console.error("Error fetching newsletter subscribers:", error);
      throw new Error("Failed to fetch newsletter subscribers");
    }
  }

  // Donation operations
  async createDonation(data: DonationData) {
    try {
      const validatedData = donationSchema.parse(data);
      
      const donationData = {
        fullName: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        amount: validatedData.amount,
        message: validatedData.message || "",
        isAnonymous: validatedData.isAnonymous || false,
        status: "pending",
        submittedAt: new Date().toISOString()
      };

      const donationRef = await database.ref('donations').push(donationData);
      
      return {
        success: true,
        id: donationRef.key,
        message: "Donation request submitted successfully!"
      };
    } catch (error) {
      console.error("Error creating donation:", error);
      return {
        success: false,
        message: "Failed to submit donation request",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async getDonations() {
    try {
      const snapshot = await database.ref('donations').once('value');
      const donations = snapshot.val() || {};
      
      return Object.entries(donations).map(([id, data]) => ({
        id,
        ...data as any
      }));
    } catch (error) {
      console.error("Error fetching donations:", error);
      throw new Error("Failed to fetch donations");
    }
  }
}

export const firebaseService = new FirebaseService();