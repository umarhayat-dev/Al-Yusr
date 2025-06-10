import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  decimal,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // quran, arabic, islamic-studies, tajweed
  level: text("level").notNull(), // beginner, intermediate, advanced
  duration: text("duration").notNull(), // e.g. "12 weeks"
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  studentCount: integer("student_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  country: text("country").notNull(),
  level: text("level").notNull(), // complete-beginner, some-knowledge, intermediate, advanced
  schedule: text("schedule").notNull(), // morning, afternoon, evening, flexible
  notes: text("notes"),
  gender: text("gender").notNull(), // Add this line
  status: text("status").default("pending"), // pending, confirmed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  courseId: integer("course_id").references(() => courses.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings)
  .omit({
    id: true,
    createdAt: true,
    status: true,
  })
  .extend({
    gender: z.enum(["Male", "Female"]),
    phone: z.string().regex(/^\+?\d{7,15}$/, "Invalid phone number"),
  });

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
