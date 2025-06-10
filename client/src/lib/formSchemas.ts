import { z } from "zod";

// Book Demos form schema
export const bookDemoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  preferredDate: z.string().min(1, "Please select a preferred date"),
  course: z.string().min(1, "Please select a course"),
  message: z.string().optional(),
});

// Contact Messages form schema
export const contactMessageSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Free Consultations form schema
export const freeConsultationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  consultationType: z.string().min(1, "Please select consultation type"),
  preferredTime: z.string().min(1, "Please select preferred time"),
  description: z.string().optional(),
});

// Newsletter Subscribers form schema
export const newsletterSubscriberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().optional(),
  preferences: z.array(z.string()).optional(),
});

// Proposed Roles form schema
export const proposedRoleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  role: z.string().min(1, "Please specify the role"),
  experience: z.string().min(10, "Please describe your experience"),
  availability: z.string().min(1, "Please specify your availability"),
  resume: z.string().optional(), // URL or file reference
});

// Reviews form schema
export const reviewSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().min(10, "Review must be at least 10 characters"),
  course: z.string().optional(),
  location: z.string().optional(),
});

// Enrollment form schema
export const enrollmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  course: z.string().min(1, "Please select a course"),
  startDate: z.string().min(1, "Please select a start date"),
  paymentMethod: z.string().min(1, "Please select a payment method"),
  emergencyContact: z.object({
    name: z.string().min(2, "Emergency contact name is required"),
    phone: z.string().min(10, "Emergency contact phone is required"),
  }),
  specialRequirements: z.string().optional(),
});

// Union type for all form types
export type FormType = 
  | "bookDemos"
  | "contactMessages" 
  | "freeConsultations"
  | "newsletterSubscribers"
  | "proposedRoles"
  | "reviews"
  | "enrollment";

// Type definitions for each form
export type BookDemoData = z.infer<typeof bookDemoSchema>;
export type ContactMessageData = z.infer<typeof contactMessageSchema>;
export type FreeConsultationData = z.infer<typeof freeConsultationSchema>;
export type NewsletterSubscriberData = z.infer<typeof newsletterSubscriberSchema>;
export type ProposedRoleData = z.infer<typeof proposedRoleSchema>;
export type ReviewData = z.infer<typeof reviewSchema>;
export type EnrollmentData = z.infer<typeof enrollmentSchema>;

// Combined form data type
export type FormData = 
  | BookDemoData
  | ContactMessageData
  | FreeConsultationData
  | NewsletterSubscriberData
  | ProposedRoleData
  | ReviewData
  | EnrollmentData;

// Schema mapping for validation
export const formSchemas = {
  bookDemos: bookDemoSchema,
  contactMessages: contactMessageSchema,
  freeConsultations: freeConsultationSchema,
  newsletterSubscribers: newsletterSubscriberSchema,
  proposedRoles: proposedRoleSchema,
  reviews: reviewSchema,
  enrollment: enrollmentSchema,
} as const;