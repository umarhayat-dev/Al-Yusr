import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithRedirect,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  getDatabase,
  ref,
  get,
  child,
  set,
  push,
  remove,
  update,
  onValue,
} from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCIWjfjo4WZETMA6_sM4su0KUKz5_hjcnQ",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "alyusrinstitute-net.firebaseapp.com",
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    "https://alyusrinstitute-net-default-rtdb.firebaseio.com/",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "alyusrinstitute-net",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "alyusrinstitute-net.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "143280268690",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:143280268690:web:ecca00df385b6857f14d4b",
  measurementId: "G-KBMH9767FP",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

const provider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = async () => {
  try {
    // Try popup first, fall back to redirect if blocked
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    if (error.code === "auth/popup-blocked") {
      // Use redirect method instead
      await signInWithRedirect(auth, provider);
      return null; // Will be handled by redirect result
    }
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing in with email:", error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing up with email:", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// User profile functions
export const createUserProfile = async (uid: string, userData: any) => {
  try {
    await setDoc(doc(db, "users", uid), userData);
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const getUserProfile = async (uid: string) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

// Admin functions
export const addReview = async (reviewData: any) => {
  try {
    await addDoc(collection(db, "reviews"), {
      ...reviewData,
      createdAt: new Date(),
      isActive: true,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
};

export const updateReview = async (reviewId: string, updateData: any) => {
  try {
    await updateDoc(doc(db, "reviews", reviewId), updateData);
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
};

export const deleteReview = async (reviewId: string) => {
  try {
    await deleteDoc(doc(db, "reviews", reviewId));
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};

export const getReviews = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "reviews"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting reviews:", error);
    throw error;
  }
};

// Get teachers from Realtime Database - INSTANT
export const getTeachers = async () => {
  try {
    console.log("Attempting to connect to Firebase Realtime Database...");
    const dbRef = ref(rtdb);
    const snapshot = await get(child(dbRef, "users"));
    console.log("Snapshot exists:", snapshot.exists());

    if (snapshot.exists()) {
      const users = snapshot.val();
      console.log("All users data:", users);
      const teachers = Object.keys(users)
        .filter((key) => {
          console.log(`User ${key} role:`, users[key].role);
          return users[key].role === "Teacher";
        })
        .map((key) => ({ id: key, ...users[key] }));
      console.log("Filtered teachers:", teachers);
      return teachers;
    } else {
      console.log("No users data found in database");
      return [];
    }
  } catch (error) {
    console.error("Error getting teachers:", error);
    console.error("Firebase error details:", error.message);
    throw error;
  }
};

// Get active students from active-students table - INSTANT
export const getActiveStudents = async () => {
  try {
    const dbRef = ref(rtdb);
    const snapshot = await get(child(dbRef, "active-students"));
    if (snapshot.exists()) {
      const activeStudents = snapshot.val();
      return Object.keys(activeStudents).map((key) => ({
        id: key,
        ...activeStudents[key],
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error getting active students:", error);
    throw error;
  }
};

// Get courses from courses table - INSTANT
export const getCourses = async () => {
  try {
    const dbRef = ref(rtdb);
    const snapshot = await get(child(dbRef, "courses"));
    if (snapshot.exists()) {
      const courses = snapshot.val();
      return Object.keys(courses).map((key) => ({ id: key, ...courses[key] }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error getting courses:", error);
    throw error;
  }
};

// Real-time course listener
export const onCoursesChange = (callback: (courses: any[]) => void) => {
  const coursesRef = ref(rtdb, "courses");
  return onValue(coursesRef, (snapshot) => {
    if (snapshot.exists()) {
      const courses = snapshot.val();
      const coursesList = Object.keys(courses).map((key) => ({ 
        id: key, 
        ...courses[key] 
      }));
      callback(coursesList);
    } else {
      callback([]);
    }
  });
};

// Real-time reviews listener (direct from Firebase)
export const onReviewsChange = (callback: (reviews: any[]) => void) => {
  const reviewsRef = ref(rtdb, "reviews");
  return onValue(reviewsRef, (snapshot) => {
    if (snapshot.exists()) {
      const reviews = snapshot.val();
      const reviewsList = Object.keys(reviews)
        .map((key) => ({ id: key, ...reviews[key] }))
        .filter(review => review.isActive !== false);
      callback(reviewsList);
    } else {
      callback([]);
    }
  });
};

// Real-time students listener
export const onStudentsChange = (callback: (students: any[]) => void) => {
  const studentsRef = ref(rtdb, "active-students");
  return onValue(studentsRef, (snapshot) => {
    if (snapshot.exists()) {
      const students = snapshot.val();
      const studentsList = Object.keys(students).map((key) => ({ 
        id: key, 
        ...students[key] 
      }));
      callback(studentsList);
    } else {
      callback([]);
    }
  });
};

// Real-time teachers listener
export const onTeachersChange = (callback: (teachers: any[]) => void) => {
  const usersRef = ref(rtdb, "users");
  return onValue(usersRef, (snapshot) => {
    if (snapshot.exists()) {
      const users = snapshot.val();
      const teachers = Object.keys(users)
        .filter((key) => users[key].role === "Teacher")
        .map((key) => ({ id: key, ...users[key] }));
      callback(teachers);
    } else {
      callback([]);
    }
  });
};

// Add data directly to Firebase RTDB
export const addCourseToFirebase = async (courseData: any) => {
  try {
    const coursesRef = ref(rtdb, "courses");
    const newCourseRef = push(coursesRef);
    await set(newCourseRef, {
      ...courseData,
      createdAt: new Date().toISOString(),
      isActive: true
    });
    return newCourseRef.key;
  } catch (error) {
    console.error("Error adding course to Firebase:", error);
    throw error;
  }
};

// Add review directly to Firebase RTDB
export const addReviewToFirebase = async (reviewData: any) => {
  try {
    const reviewsRef = ref(rtdb, "reviews");
    const newReviewRef = push(reviewsRef);
    await set(newReviewRef, {
      ...reviewData,
      createdAt: new Date().toISOString(),
      isActive: true
    });
    return newReviewRef.key;
  } catch (error) {
    console.error("Error adding review to Firebase:", error);
    throw error;
  }
};

// Submit form data directly to Firebase RTDB
export const submitContactFormToFirebase = async (formData: any) => {
  try {
    const contactRef = ref(rtdb, "contact-forms");
    const newContactRef = push(contactRef);
    await set(newContactRef, {
      ...formData,
      submittedAt: new Date().toISOString(),
      status: "pending"
    });
    return newContactRef.key;
  } catch (error) {
    console.error("Error submitting contact form to Firebase:", error);
    throw error;
  }
};

// Submit enrollment data directly to Firebase RTDB
export const submitEnrollmentToFirebase = async (enrollmentData: any) => {
  try {
    const enrollmentRef = ref(rtdb, "enrollments");
    const newEnrollmentRef = push(enrollmentRef);
    await set(newEnrollmentRef, {
      ...enrollmentData,
      submittedAt: new Date().toISOString(),
      status: "pending"
    });
    return newEnrollmentRef.key;
  } catch (error) {
    console.error("Error submitting enrollment to Firebase:", error);
    throw error;
  }
};

// Get real-time stats for admin dashboard
export const onStatsChange = (callback: (stats: any) => void) => {
  const statsRef = ref(rtdb, "stats");
  return onValue(statsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      // Calculate stats from other data if stats node doesn't exist
      const studentsRef = ref(rtdb, "active-students");
      const coursesRef = ref(rtdb, "courses");
      const teachersRef = ref(rtdb, "users");
      
      Promise.all([
        get(studentsRef),
        get(coursesRef),
        get(teachersRef)
      ]).then(([studentsSnap, coursesSnap, teachersSnap]) => {
        const students = studentsSnap.exists() ? Object.keys(studentsSnap.val()).length : 0;
        const courses = coursesSnap.exists() ? Object.keys(coursesSnap.val()).length : 0;
        const allUsers = teachersSnap.exists() ? teachersSnap.val() : {};
        const teachers = Object.values(allUsers).filter((user: any) => user.role === "Teacher").length;
        
        callback({
          totalStudents: students,
          totalCourses: courses,
          totalTeachers: teachers,
          activeStudents: students
        });
      });
    }
  });
};

// Get students from Realtime Database - INSTANT
export const getStudents = async () => {
  try {
    const dbRef = ref(rtdb);
    const snapshot = await get(child(dbRef, "users"));
    if (snapshot.exists()) {
      const users = snapshot.val();
      const students = Object.keys(users)
        .filter((key) => users[key].role === "Student")
        .map((key) => ({ id: key, ...users[key] }));
      return students;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error getting students:", error);
    throw error;
  }
};

// Get admins from Realtime Database - INSTANT
export const getAdmins = async () => {
  try {
    const dbRef = ref(rtdb);
    const snapshot = await get(child(dbRef, "users"));
    if (snapshot.exists()) {
      const users = snapshot.val();
      const admins = Object.keys(users)
        .filter((key) => users[key].role === "Admin")
        .map((key) => ({ id: key, ...users[key] }));
      return admins;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error getting admins:", error);
    throw error;
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

// =============================================================================
// REALTIME DATABASE FUNCTIONS FOR STUDENTS, COURSES, JOBS, INQUIRIES, etc.
// =============================================================================

// Students Management
export const addStudentToRTDB = async (studentData: any) => {
  try {
    const studentsRef = ref(rtdb, "active-students");
    const newStudentRef = push(studentsRef);
    await set(newStudentRef, {
      ...studentData,
      createdAt: new Date().toISOString(),
    });
    return newStudentRef.key;
  } catch (error) {
    console.error("Error adding student:", error);
    throw error;
  }
};

export const deleteStudentFromRTDB = async (studentId: string) => {
  try {
    const studentRef = ref(rtdb, `active-students/${studentId}`);
    await remove(studentRef);
  } catch (error) {
    console.error("Error deleting student:", error);
    throw error;
  }
};

// Courses Management
export const addCourseToRTDB = async (courseData: any) => {
  try {
    const coursesRef = ref(rtdb, "courses");
    const newCourseRef = push(coursesRef);
    await set(newCourseRef, {
      ...courseData,
      createdAt: new Date().toISOString(),
    });
    return newCourseRef.key;
  } catch (error) {
    console.error("Error adding course:", error);
    throw error;
  }
};

export const deleteCourseFromRTDB = async (courseId: string) => {
  try {
    const courseRef = ref(rtdb, `courses/${courseId}`);
    await remove(courseRef);
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};

export const getCoursesFromRTDB = (callback: (courses: any[]) => void) => {
  const coursesRef = ref(rtdb, "courses");
  return onValue(coursesRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const coursesArray = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      callback(coursesArray);
    } else {
      callback([]);
    }
  });
};

// Jobs Management
export const addJobToRTDB = async (jobData: any) => {
  try {
    const jobsRef = ref(rtdb, "jobs");
    const newJobRef = push(jobsRef);
    const jobId = newJobRef.key;
    await set(newJobRef, {
      ...jobData,
      id: jobId,
      createdAt: new Date().toISOString(),
    });
    return jobId;
  } catch (error) {
    console.error("Error adding job:", error);
    throw error;
  }
};

export const deleteJobFromRTDB = async (jobId: string) => {
  try {
    const jobRef = ref(rtdb, `jobs/${jobId}`);
    await remove(jobRef);
  } catch (error) {
    console.error("Error deleting job:", error);
    throw error;
  }
};

export const getJobsFromRTDB = (callback: (jobs: any[]) => void) => {
  const jobsRef = ref(rtdb, "jobs");
  return onValue(jobsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const jobsArray = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      callback(jobsArray);
    } else {
      callback([]);
    }
  });
};

// Inquiries Management
export const addInquiryToRTDB = async (inquiryData: any) => {
  try {
    const inquiriesRef = ref(rtdb, "inquiries");
    const newInquiryRef = push(inquiriesRef);
    await set(newInquiryRef, {
      ...inquiryData,
      status: "Pending",
      createdAt: new Date().toISOString(),
    });
    return newInquiryRef.key;
  } catch (error) {
    console.error("Error adding inquiry:", error);
    throw error;
  }
};

export const updateInquiryStatusRTDB = async (
  inquiryId: string,
  status: string,
) => {
  try {
    const inquiryRef = ref(rtdb, `inquiries/${inquiryId}`);
    await update(inquiryRef, {
      status: status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating inquiry:", error);
    throw error;
  }
};

export const getInquiriesFromRTDB = (callback: (inquiries: any[]) => void) => {
  const inquiriesRef = ref(rtdb, "inquiries");
  return onValue(inquiriesRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const inquiriesArray = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      callback(inquiriesArray);
    } else {
      callback([]);
    }
  });
};

// Replacement Class Requests Management
export const addReplacementRequestToRTDB = async (requestData: any) => {
  try {
    const requestsRef = ref(rtdb, "replacement-requests");
    const newRequestRef = push(requestsRef);
    await set(newRequestRef, {
      ...requestData,
      status: "Pending",
      createdAt: new Date().toISOString(),
    });
    return newRequestRef.key;
  } catch (error) {
    console.error("Error adding replacement request:", error);
    throw error;
  }
};

export const updateReplacementRequestStatusRTDB = async (
  requestId: string,
  status: string,
) => {
  try {
    const requestRef = ref(rtdb, `replacement-requests/${requestId}`);
    await update(requestRef, {
      status: status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating replacement request:", error);
    throw error;
  }
};

export const getReplacementRequestsFromRTDB = (
  callback: (requests: any[]) => void,
) => {
  const requestsRef = ref(rtdb, "replacement-requests");
  return onValue(requestsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const requestsArray = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      callback(requestsArray);
    } else {
      callback([]);
    }
  });
};

// Contact Forms Management
export const addContactFormToRTDB = async (contactData: any) => {
  try {
    const contactRef = ref(rtdb, "contact-forms");
    const newContactRef = push(contactRef);
    const contactId = newContactRef.key;
    await set(newContactRef, {
      ...contactData,
      id: contactId,
      createdAt: new Date().toISOString(),
      status: "New",
    });
    return contactId;
  } catch (error) {
    console.error("Error adding contact form:", error);
    throw error;
  }
};

export const getContactFormsFromRTDB = (callback: (forms: any[]) => void) => {
  const formsRef = ref(rtdb, "contact-forms");
  return onValue(formsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const formsArray = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      callback(formsArray);
    } else {
      callback([]);
    }
  });
};

// Newsletter Subscribers Management (for backup/admin viewing)
export const addNewsletterSubscriberToRTDB = async (subscriberData: any) => {
  try {
    const subscribersRef = ref(rtdb, "newsletter-subscribers");
    const newSubscriberRef = push(subscribersRef);
    const subscriberId = newSubscriberRef.key;
    await set(newSubscriberRef, {
      ...subscriberData,
      id: subscriberId,
      createdAt: new Date().toISOString(),
      status: "Active",
    });
    return subscriberId;
  } catch (error) {
    console.error("Error adding newsletter subscriber:", error);
    throw error;
  }
};

export const getNewsletterSubscribersFromRTDB = (
  callback: (subscribers: any[]) => void,
) => {
  const subscribersRef = ref(rtdb, "newsletter-subscribers");
  return onValue(subscribersRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const subscribersArray = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      callback(subscribersArray);
    } else {
      callback([]);
    }
  });
};
