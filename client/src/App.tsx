import { useState, useEffect } from "react";
import { Router, Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Courses from "./pages/Courses";
import ContactPage from "./pages/ContactPage";
import Reviews from "./pages/Reviews";
import Careers from "./pages/Careers";
import Donations from "./pages/Donations";
import Login from "./pages/Login";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import TeacherDashboard from "./pages/dashboards/TeacherDashboard";
import StudentDashboard from "./pages/dashboards/StudentDashboard";
import FinanceDashboard from "./pages/dashboards/FinanceDashboard";
import NotFound from "./pages/not-found";
import LoginModal from "./components/LoginModal";
import BookingModal from "./components/BookingModal";
import ConsultationModal from "./components/ConsultationModal";
import ProtectedRoute from "./components/ProtectedRoute";
import { authService, type AuthUser } from "./lib/auth";
import { getCourses } from "./lib/firebase";
import type { Course } from "@shared/schema";

// Remove old User interface - using AuthUser from auth service

// Create a client
const queryClient = new QueryClient();

export default function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>(undefined);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);

  // Handle auth state changes with RTDB authentication
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await getCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  const handleBookDemoClick = (courseId?: string | number) => {
    // Convert string courseId to number if needed for BookingModal
    const numericCourseId = typeof courseId === 'string' ? parseInt(courseId) : courseId;
    setSelectedCourseId(numericCourseId);
    setShowBookingModal(true);
  };

  const handleConsultationClick = () => {
    setShowConsultationModal(true);
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
      <div className="min-h-screen bg-background">
        <Navigation 
          onBookDemoClick={() => handleBookDemoClick()}
          onConsultationClick={handleConsultationClick}
          onLoginClick={handleLoginClick}
          user={user}
          onLogout={handleLogout}
          isLoading={isLoading}
        />
        <main>
          <Switch>
            <Route path="/">
              {() => <Home onBookDemoClick={handleBookDemoClick} onConsultationClick={handleConsultationClick} />}
            </Route>
            <Route path="/about">
              {() => <About />}
            </Route>
            <Route path="/courses">
              {() => <Courses onEnrollClick={handleBookDemoClick} />}
            </Route>
            <Route path="/contact">
              {() => <ContactPage />}
            </Route>
            <Route path="/reviews">
              {() => <Reviews />}
            </Route>
            <Route path="/careers">
              {() => <Careers />}
            </Route>
            <Route path="/donate">
              {() => <Donations />}
            </Route>
            <Route path="/login">
              {() => <Login />}
            </Route>
            <Route path="/admin">
              {() => (
                <ProtectedRoute dashboardType="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              )}
            </Route>
            <Route path="/teacher">
              {() => (
                <ProtectedRoute dashboardType="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              )}
            </Route>
            <Route path="/student">
              {() => (
                <ProtectedRoute dashboardType="student">
                  <StudentDashboard />
                </ProtectedRoute>
              )}
            </Route>
            <Route path="/finance">
              {() => (
                <ProtectedRoute dashboardType="finance">
                  <FinanceDashboard />
                </ProtectedRoute>
              )}
            </Route>
            <Route>
              {() => <NotFound />}
            </Route>
          </Switch>
        </main>

        <Footer />

        <LoginModal
          open={showLoginModal}
          onOpenChange={setShowLoginModal}
        />

        <BookingModal
          open={showBookingModal}
          onOpenChange={setShowBookingModal}
          courses={courses}
          selectedCourseId={selectedCourseId}
        />

        <ConsultationModal
          open={showConsultationModal}
          onOpenChange={setShowConsultationModal}
        />
      </div>
      </Router>
    </QueryClientProvider>
  );
}