import { users, courses, bookings, reviews, type User, type InsertUser, type Course, type InsertCourse, type Booking, type InsertBooking, type Review, type InsertReview } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Courses
  getAllCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // Bookings
  getAllBookings(): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  
  // Reviews
  getAllReviews(): Promise<Review[]>;
  getActiveReviews(): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private bookings: Map<number, Booking>;
  private reviews: Map<number, Review>;
  private currentUserId: number;
  private currentCourseId: number;
  private currentBookingId: number;
  private currentReviewId: number;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.bookings = new Map();
    this.reviews = new Map();
    this.currentUserId = 1;
    this.currentCourseId = 1;
    this.currentBookingId = 1;
    this.currentReviewId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Sample courses
    const sampleCourses: Course[] = [
      {
        id: 1,
        title: "Quran for Beginners",
        description: "Learn to read the Quran with proper pronunciation and basic Tajweed rules. Perfect for new Muslims and beginners.",
        category: "quran",
        level: "beginner",
        duration: "12 weeks",
        price: "99.00",
        studentCount: 1234,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 2,
        title: "Modern Standard Arabic",
        description: "Comprehensive Arabic language course covering grammar, vocabulary, and conversation skills for everyday communication.",
        category: "arabic",
        level: "intermediate",
        duration: "16 weeks",
        price: "149.00",
        studentCount: 856,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 3,
        title: "Advanced Tajweed",
        description: "Master the art of Quranic recitation with advanced Tajweed rules, melodious recitation techniques, and beautiful voices.",
        category: "tajweed",
        level: "advanced",
        duration: "20 weeks",
        price: "199.00",
        studentCount: 523,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 4,
        title: "Quran for Kids",
        description: "Fun and interactive Quran learning program designed specifically for children ages 6-12 with games and activities.",
        category: "quran",
        level: "beginner",
        duration: "8 weeks",
        price: "69.00",
        studentCount: 2156,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 5,
        title: "Islamic Jurisprudence (Fiqh)",
        description: "Learn the fundamental principles of Islamic law and jurisprudence with practical applications in daily life.",
        category: "islamic-studies",
        level: "intermediate",
        duration: "14 weeks",
        price: "129.00",
        studentCount: 687,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 6,
        title: "Islamic History & Biography",
        description: "Explore the rich history of Islam, the life of Prophet Muhammad (PBUH), and the stories of the righteous predecessors.",
        category: "islamic-studies",
        level: "beginner",
        duration: "10 weeks",
        price: "89.00",
        studentCount: 945,
        isActive: true,
        createdAt: new Date(),
      },
    ];

    sampleCourses.forEach(course => {
      this.courses.set(course.id, course);
      this.currentCourseId = Math.max(this.currentCourseId, course.id + 1);
    });

    // Approved reviews only (Column A = "Yes" from Google Sheets)
    const sampleReviews: Review[] = [
      {
        id: 1,
        name: "Sarah Johnson",
        location: "United States",
        rating: 5,
        comment: "Alhamdulillah, I have been learning with AlYusr Institute for over a year now, and it has been an incredible journey. The teachers are so patient and knowledgeable, and they really care about each student's progress. I've improved my Quran recitation tremendously!",
        courseId: 1,
        isActive: true,
        createdAt: new Date("2024-01-15"),
      },
      {
        id: 2,
        name: "Ahmed Al-Rashid",
        location: "United Kingdom", 
        rating: 5,
        comment: "SubhanAllah, the Arabic course at AlYusr Institute has opened up so many doors for me. I can now understand the Quran in its original language, and my prayer experience has become so much more meaningful. The structured approach and dedicated teachers made all the difference.",
        courseId: 2,
        isActive: true,
        createdAt: new Date("2024-02-20"),
      },
      {
        id: 3,
        name: "Fatima Hassan",
        location: "Canada",
        rating: 5,
        comment: "As a working mother, I was worried about finding time for Islamic studies. But AlYusr Institute's flexible scheduling has been a blessing. I can learn at my own pace, and the teachers are understanding of my busy schedule. My children see me learning and are inspired too!",
        courseId: 3,
        isActive: true,
        createdAt: new Date("2024-03-10"),
      },
      {
        id: 4,
        name: "Omar Abdullah",
        location: "Australia",
        rating: 5,
        comment: "The Tajweed course has completely transformed my relationship with the Quran. Before, I was just reading words. Now, I'm connecting with Allah's message in a way I never thought possible. The pronunciation correction and detailed feedback from my teacher have been invaluable.",
        courseId: 4,
        isActive: true,
        createdAt: new Date("2024-04-05"),
      },
      {
        id: 5,
        name: "Aisha Muhammad",
        location: "Germany",
        rating: 5,
        comment: "Living in a non-Muslim country, I was struggling to give my children proper Islamic education. AlYusr Institute has been the answer to my prayers. My kids love their Quran classes, and I see them growing in their faith every day. JazakAllahu khair to all the teachers!",
        courseId: 5,
        isActive: true,
        createdAt: new Date("2024-05-12"),
      },
      {
        id: 6,
        name: "Yusuf Ibrahim",
        location: "Malaysia",
        rating: 5,
        comment: "I've tried many online Islamic education platforms, but none compare to AlYusr Institute. The quality of teaching, the personalized attention, and the genuine care for students' spiritual growth sets them apart. I'm now working on memorizing the Quran, something I never thought possible at my age!",
        courseId: 6,
        isActive: true,
        createdAt: new Date("2024-06-18"),
      },
      {
        id: 7,
        name: "Khadija Ali",
        location: "France",
        rating: 5,
        comment: "The Islamic Studies course has deepened my understanding of my faith in ways I couldn't imagine. The teachers present complex topics in such a clear and engaging manner. I feel more confident in my Islamic knowledge and can now answer my children's questions about Islam with proper understanding.",
        courseId: 7,
        isActive: true,
        createdAt: new Date("2024-07-22"),
      },
      {
        id: 8,
        name: "Hassan Ahmed",
        location: "United Arab Emirates",
        rating: 5,
        comment: "Even though I'm an Arabic speaker, the advanced Quran studies course at AlYusr Institute has given me insights I never had before. The scholarly approach and the depth of explanation have enhanced my understanding of the Quran's wisdom. Truly exceptional teaching!",
        courseId: 8,
        isActive: true,
        createdAt: new Date("2024-08-30"),
      },
    ];

    sampleReviews.forEach(review => {
      this.reviews.set(review.id, review);
      this.currentReviewId = Math.max(this.currentReviewId, review.id + 1);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Courses
  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(course => course.isActive);
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.currentCourseId++;
    const course: Course = { 
      ...insertCourse, 
      id,
      createdAt: new Date(),
    };
    this.courses.set(id, course);
    return course;
  }

  // Bookings
  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = { 
      ...insertBooking, 
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.bookings.set(id, booking);
    return booking;
  }

  // Reviews
  async getAllReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values());
  }

  async getActiveReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.isActive);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const review: Review = { 
      ...insertReview, 
      id,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);
    return review;
  }
}

export const storage = new MemStorage();
