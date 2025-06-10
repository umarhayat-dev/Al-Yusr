import { useState, useEffect } from "react";
import { 
  onCoursesChange, 
  onReviewsChange, 
  onStudentsChange,
  addCourseToFirebase,
  addReviewToFirebase,
  submitContactFormToFirebase
} from "@/lib/firebase";

// Example component showing direct Firebase SDK usage
export default function DirectFirebaseExample() {
  const [courses, setCourses] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Setting up real-time Firebase listeners...");
    
    // Set up real-time listeners
    const unsubscribeCourses = onCoursesChange((coursesData) => {
      console.log("Courses updated from Firebase:", coursesData);
      setCourses(coursesData);
      setLoading(false);
    });

    const unsubscribeReviews = onReviewsChange((reviewsData) => {
      console.log("Reviews updated from Firebase:", reviewsData);
      setReviews(reviewsData);
    });

    const unsubscribeStudents = onStudentsChange((studentsData) => {
      console.log("Students updated from Firebase:", studentsData);
      setStudents(studentsData);
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeCourses();
      unsubscribeReviews();
      unsubscribeStudents();
    };
  }, []);

  // Add new course directly to Firebase
  const handleAddCourse = async () => {
    try {
      const newCourse = {
        title: "New Course",
        description: "Course description",
        category: "Quran",
        level: "Beginner",
        duration: "3 months"
      };
      
      const courseId = await addCourseToFirebase(newCourse);
      console.log("Course added with ID:", courseId);
    } catch (error) {
      console.error("Error adding course:", error);
    }
  };

  // Add new review directly to Firebase
  const handleAddReview = async () => {
    try {
      const newReview = {
        name: "John Doe",
        email: "john@example.com",
        course: "Quran Reading",
        rating: 5,
        review: "Excellent course!"
      };
      
      const reviewId = await addReviewToFirebase(newReview);
      console.log("Review added with ID:", reviewId);
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };

  // Submit contact form directly to Firebase
  const handleSubmitContact = async () => {
    try {
      const contactData = {
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+1234567890",
        subject: "General Inquiry",
        message: "I'm interested in your courses."
      };
      
      const contactId = await submitContactFormToFirebase(contactData);
      console.log("Contact form submitted with ID:", contactId);
    } catch (error) {
      console.error("Error submitting contact form:", error);
    }
  };

  if (loading) {
    return <div>Loading data from Firebase...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Direct Firebase SDK Integration</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Courses Section */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Courses ({courses.length})</h3>
          <button 
            onClick={handleAddCourse}
            className="mb-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Add Course
          </button>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {courses.map((course) => (
              <div key={course.id} className="text-sm border-b pb-1">
                <strong>{course.title}</strong>
                <br />
                <span className="text-gray-600">{course.category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Reviews ({reviews.length})</h3>
          <button 
            onClick={handleAddReview}
            className="mb-2 px-3 py-1 bg-green-500 text-white rounded text-sm"
          >
            Add Review
          </button>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {reviews.map((review) => (
              <div key={review.id} className="text-sm border-b pb-1">
                <strong>{review.name}</strong>
                <br />
                <span className="text-gray-600">Rating: {review.rating}/5</span>
              </div>
            ))}
          </div>
        </div>

        {/* Students Section */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Students ({students.length})</h3>
          <button 
            onClick={handleSubmitContact}
            className="mb-2 px-3 py-1 bg-purple-500 text-white rounded text-sm"
          >
            Submit Contact
          </button>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {students.map((student) => (
              <div key={student.id} className="text-sm border-b pb-1">
                <strong>{student.name || student.fullName}</strong>
                <br />
                <span className="text-gray-600">{student.email}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h4 className="font-semibold mb-2">Firebase SDK Integration Benefits:</h4>
        <ul className="text-sm space-y-1">
          <li>• Real-time data updates without page refresh</li>
          <li>• No backend API dependencies</li>
          <li>• Direct database operations from frontend</li>
          <li>• Instant data synchronization across components</li>
          <li>• Offline capability with Firebase caching</li>
        </ul>
      </div>
    </div>
  );
}