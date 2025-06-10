import { ref, push, set, remove, onValue, off, update } from 'firebase/database';
import { rtdb } from './firebase';

// Course Management
export const addCourse = async (courseData: {
  title: string;
  description: string;
  duration: string;
  price: string;
  category: string;
  level: string;
  image?: string;
}) => {
  try {
    const coursesRef = ref(rtdb, 'courses');
    const newCourseRef = push(coursesRef);
    await set(newCourseRef, {
      ...courseData,
      createdAt: Date.now(),
      isActive: true,
      studentCount: 0
    });
    return newCourseRef.key;
  } catch (error) {
    console.error('Error adding course:', error);
    throw error;
  }
};

export const deleteCourse = async (courseId: string) => {
  try {
    const courseRef = ref(rtdb, `courses/${courseId}`);
    await remove(courseRef);
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

export const getCourses = (callback: (courses: any[]) => void) => {
  const coursesRef = ref(rtdb, 'courses');
  const unsubscribe = onValue(coursesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const coursesList = Object.entries(data).map(([id, course]: [string, any]) => ({
        id,
        ...(course as object)
      }));
      callback(coursesList);
    } else {
      callback([]);
    }
  });
  return () => off(coursesRef, 'value', unsubscribe);
};

// Job Posting Management
export const addJob = async (jobData: {
  title: string;
  description: string;
  location: string;
  type: string;
  requirements: string;
  salary?: string;
}) => {
  try {
    const jobsRef = ref(rtdb, 'jobs');
    const newJobRef = push(jobsRef);
    await set(newJobRef, {
      ...jobData,
      createdAt: Date.now(),
      isActive: true
    });
    return newJobRef.key;
  } catch (error) {
    console.error('Error adding job:', error);
    throw error;
  }
};

export const deleteJob = async (jobId: string) => {
  try {
    const jobRef = ref(rtdb, `jobs/${jobId}`);
    await remove(jobRef);
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};

export const getJobs = (callback: (jobs: any[]) => void) => {
  const jobsRef = ref(rtdb, 'jobs');
  const unsubscribe = onValue(jobsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const jobsList = Object.entries(data).map(([id, job]: [string, any]) => ({
        id,
        ...(job as object)
      }));
      callback(jobsList);
    } else {
      callback([]);
    }
  });
  return () => off(jobsRef, 'value', unsubscribe);
};

// Teacher Management
export const addTeacher = async (teacherData: {
  name: string;
  email: string;
  specialty: string;
  experience: string;
  bio?: string;
}) => {
  try {
    const teachersRef = ref(rtdb, 'teachers');
    const newTeacherRef = push(teachersRef);
    await set(newTeacherRef, {
      ...teacherData,
      createdAt: Date.now(),
      isActive: true,
      students: 0,
      rating: 5.0
    });
    return newTeacherRef.key;
  } catch (error) {
    console.error('Error adding teacher:', error);
    throw error;
  }
};

export const deleteTeacher = async (teacherId: string) => {
  try {
    const teacherRef = ref(rtdb, `teachers/${teacherId}`);
    await remove(teacherRef);
  } catch (error) {
    console.error('Error deleting teacher:', error);
    throw error;
  }
};

export const getTeachers = (callback: (teachers: any[]) => void) => {
  const teachersRef = ref(rtdb, 'teachers');
  const unsubscribe = onValue(teachersRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const teachersList = Object.entries(data).map(([id, teacher]: [string, any]) => ({
        id,
        ...(teacher as object)
      }));
      callback(teachersList);
    } else {
      callback([]);
    }
  });
  return () => off(teachersRef, 'value', unsubscribe);
};

// Student Management
export const addStudent = async (studentData: {
  name: string;
  email: string;
  course: string;
  phone?: string;
  level: string;
}) => {
  try {
    const studentsRef = ref(rtdb, 'students');
    const newStudentRef = push(studentsRef);
    await set(newStudentRef, {
      ...studentData,
      createdAt: Date.now(),
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0]
    });
    return newStudentRef.key;
  } catch (error) {
    console.error('Error adding student:', error);
    throw error;
  }
};

export const deleteStudent = async (studentId: string) => {
  try {
    const studentRef = ref(rtdb, `students/${studentId}`);
    await remove(studentRef);
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
};

export const getStudents = (callback: (students: any[]) => void) => {
  const studentsRef = ref(rtdb, 'students');
  const unsubscribe = onValue(studentsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const studentsList = Object.entries(data).map(([id, student]: [string, any]) => ({
        id,
        ...(student as object)
      }));
      callback(studentsList);
    } else {
      callback([]);
    }
  });
  return () => off(studentsRef, 'value', unsubscribe);
};

// Stats Management
export const getStats = (callback: (stats: any) => void) => {
  const studentsRef = ref(rtdb, 'students');
  const teachersRef = ref(rtdb, 'teachers');
  const coursesRef = ref(rtdb, 'courses');
  
  let studentsCount = 0;
  let teachersCount = 0;
  let coursesCount = 0;
  
  const updateStats = () => {
    callback({
      totalStudents: studentsCount,
      activeTeachers: teachersCount,
      activeCourses: coursesCount,
      monthlyRevenue: 0, // Calculate from payments when implemented
      pendingApprovals: 0,
      newInquiries: 0
    });
  };

  const unsubscribeStudents = onValue(studentsRef, (snapshot) => {
    const data = snapshot.val();
    studentsCount = data ? Object.keys(data).length : 0;
    updateStats();
  });

  const unsubscribeTeachers = onValue(teachersRef, (snapshot) => {
    const data = snapshot.val();
    teachersCount = data ? Object.keys(data).length : 0;
    updateStats();
  });

  const unsubscribeCourses = onValue(coursesRef, (snapshot) => {
    const data = snapshot.val();
    coursesCount = data ? Object.keys(data).length : 0;
    updateStats();
  });

  return () => {
    off(studentsRef, 'value', unsubscribeStudents);
    off(teachersRef, 'value', unsubscribeTeachers);
    off(coursesRef, 'value', unsubscribeCourses);
  };
};

// Inquiries Management
export const getInquiries = (callback: (inquiries: any[]) => void) => {
  const inquiriesRef = ref(rtdb, 'inquiries');
  const unsubscribe = onValue(inquiriesRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const inquiriesArray = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
      callback(inquiriesArray);
    } else {
      callback([]);
    }
  });
  return () => off(inquiriesRef, 'value', unsubscribe);
};

export const updateInquiryStatus = async (inquiryId: string, status: string) => {
  try {
    const inquiryRef = ref(rtdb, `inquiries/${inquiryId}`);
    await update(inquiryRef, { 
      status,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    throw error;
  }
};

// Reviews Management
export const getPendingReviews = (callback: (reviews: any[]) => void) => {
  const reviewsRef = ref(rtdb, 'reviews');
  const unsubscribe = onValue(reviewsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const reviewsArray = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
      callback(reviewsArray);
    } else {
      callback([]);
    }
  });
  return () => off(reviewsRef, 'value', unsubscribe);
};

export const updateReviewStatus = async (reviewId: string, status: string) => {
  try {
    const reviewRef = ref(rtdb, `reviews/${reviewId}`);
    await update(reviewRef, { 
      status,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    throw error;
  }
};

// Replacement Class Requests Management
export const getReplacementRequests = (callback: (requests: any[]) => void) => {
  const requestsRef = ref(rtdb, 'replacement-requests');
  const unsubscribe = onValue(requestsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const requestsArray = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
      callback(requestsArray);
    } else {
      callback([]);
    }
  });
  return () => off(requestsRef, 'value', unsubscribe);
};

export const updateReplacementRequestStatus = async (requestId: string, status: string) => {
  try {
    const requestRef = ref(rtdb, `replacement-requests/${requestId}`);
    await update(requestRef, { 
      status,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error('Error updating replacement request status:', error);
    throw error;
  }
};

// Active Students Management - New functions for your specific data structure
export const getActiveStudents = (callback: (students: any[]) => void) => {
  const activeStudentsRef = ref(rtdb, 'active-students');
  const unsubscribe = onValue(activeStudentsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const studentsList = Object.entries(data).map(([id, student]: [string, any]) => ({
        id,
        name: student['student-name'] || '',
        email: student['st-email'] || '',
        serialNumber: student['st-serial'] || '',
        courseCode: student['course-code'] || '',
        teacherName: student['teacher-name'] || '',
        teacherEmail: student['te-email'] || '',
        teacherSerial: student['te-serial'] || '',
        status: student.status || 'Active',
        fee: student.fee || 0,
        currency: student.currency || 'AED'
      }));
      callback(studentsList);
    } else {
      callback([]);
    }
  });
  return () => off(activeStudentsRef, 'value', unsubscribe);
};

export const getActiveTeachers = (callback: (teachers: any[]) => void) => {
  const activeStudentsRef = ref(rtdb, 'active-students');
  const unsubscribe = onValue(activeStudentsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Group students by teacher
      const teacherMap = new Map();
      
      Object.entries(data).forEach(([id, student]: [string, any]) => {
        const teacherSerial = student['te-serial'];
        const teacherName = student['teacher-name'];
        const teacherEmail = student['te-email'];
        const courseCode = student['course-code'];
        const studentName = student['student-name'];
        
        if (teacherSerial && teacherName) {
          if (!teacherMap.has(teacherSerial)) {
            teacherMap.set(teacherSerial, {
              id: teacherSerial,
              name: teacherName,
              email: teacherEmail || '',
              serialNumber: teacherSerial,
              courseCodes: new Set(),
              activeStudents: [],
              studentCount: 0
            });
          }
          
          const teacher = teacherMap.get(teacherSerial);
          if (courseCode) teacher.courseCodes.add(courseCode);
          if (studentName) teacher.activeStudents.push(studentName);
          teacher.studentCount++;
        }
      });
      
      // Convert to array and format course codes
      const teachersList = Array.from(teacherMap.values()).map(teacher => ({
        ...teacher,
        courseCodes: Array.from(teacher.courseCodes).join(', '),
        activeStudentsCount: teacher.studentCount
      }));
      
      callback(teachersList);
    } else {
      callback([]);
    }
  });
  return () => off(activeStudentsRef, 'value', unsubscribe);
};

export const getActiveStudentsStats = (callback: (stats: any) => void) => {
  const activeStudentsRef = ref(rtdb, 'active-students');
  const coursesRef = ref(rtdb, 'courses');
  
  let activeStudentsCount = 0;
  let activeTeachersCount = 0;
  let coursesCount = 0;
  let totalRevenue = 0;
  
  const updateStats = () => {
    callback({
      totalStudents: activeStudentsCount,
      activeTeachers: activeTeachersCount,
      activeCourses: coursesCount,
      monthlyRevenue: totalRevenue,
      pendingApprovals: 0,
      newInquiries: 0
    });
  };

  const unsubscribeStudents = onValue(activeStudentsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      activeStudentsCount = Object.keys(data).length;
      
      // Calculate unique teachers
      const teacherSerials = new Set();
      let revenue = 0;
      
      Object.values(data).forEach((student: any) => {
        if (student['te-serial']) {
          teacherSerials.add(student['te-serial']);
        }
        if (student.fee) {
          revenue += parseFloat(student.fee) || 0;
        }
      });
      
      activeTeachersCount = teacherSerials.size;
      totalRevenue = revenue;
    } else {
      activeStudentsCount = 0;
      activeTeachersCount = 0;
      totalRevenue = 0;
    }
    updateStats();
  });

  const unsubscribeCourses = onValue(coursesRef, (snapshot) => {
    const data = snapshot.val();
    coursesCount = data ? Object.keys(data).length : 0;
    updateStats();
  });

  return () => {
    off(activeStudentsRef, 'value', unsubscribeStudents);
    off(coursesRef, 'value', unsubscribeCourses);
  };
};