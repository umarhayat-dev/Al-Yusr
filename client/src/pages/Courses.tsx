import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Clock, Calendar, MessageCircle } from "lucide-react";
import { getCoursesFromRTDB } from "@/lib/firebase";
import ConsultationForm from "@/components/forms/ConsultationForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface CoursesProps {
  onEnrollClick: (courseId: number) => void;
}

interface Course {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  timings: string;
  description: string;
  image: string;
}

export default function Courses({ onEnrollClick }: CoursesProps) {
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Fetching courses directly from Firebase...");
    setLoading(true);
    setError(null);

    try {
      const unsubscribe = getCoursesFromRTDB((coursesData) => {
        console.log("Received courses data from Firebase RTDB:", coursesData);

        if (coursesData && coursesData.length > 0) {
          const formattedCourses = coursesData.map((course: any) => ({
            id: course.id || course["course-code"] || Math.random().toString(),
            title: course.title || course.name || "Course Title",
            subtitle: course.description
              ? course.description.substring(0, 60) + "..."
              : "Islamic Education Course",
            duration: course.duration || "Flexible Schedule",
            timings: course.schedule || course.timings || "Contact for schedule",
            description: course.description || "Comprehensive Islamic education course designed to enhance your understanding.",
            image:
              course.category === "Quran"
                ? "📖"
                : course.category === "Islamic Studies"
                  ? "🕌"
                  : course.category === "Arabic"
                    ? "✨"
                    : "📚",
          }));
          setCourses(formattedCourses);
        } else {
          console.log("No courses found");
          setCourses([]);
        }
        setLoading(false);
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    } catch (err) {
      console.error("Error setting up courses listener:", err);
      setError("Failed to load courses");
      setLoading(false);
    }
  }, []);

  const toggleCourse = (courseId: number) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#013626] py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Islamic <span className="text-green-200">Courses</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl leading-relaxed">
              Comprehensive Islamic education designed by qualified scholars
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-bottle-green-800 mb-4">
            Available Courses
          </h2>
          <p className="text-xl text-bottle-green-600 max-w-2xl mx-auto">
            Discover our comprehensive Islamic education programs designed for
            learners of all levels
          </p>
        </div>

        {/* Courses Grid */}
        <div className="max-w-4xl mx-auto space-y-6">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-bottle-green-700 border-t-transparent"></div>
              <p className="mt-4 text-lg text-bottle-green-600">Loading courses...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-lg text-red-600">{error}</p>
              <p className="mt-2 text-gray-600">
                Please try refreshing the page
              </p>
            </div>
          )}

          {!loading && !error && courses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">
                No courses available at the moment.
              </p>
              <p className="mt-2 text-gray-500">Please check back later.</p>
            </div>
          )}

          {!loading &&
            !error &&
            courses.map((course) => (
              <Card
                key={course.id}
                className="rounded-2xl overflow-hidden card-hover"
              >
                <CardContent className="p-0">
                  {/* Course Header - Always Visible */}
                  <div
                    className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => toggleCourse(course.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{course.image}</div>
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900">
                            {course.title}
                          </h3>
                          <p className="text-slate-600">{course.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEnrollClick(course.id);
                          }}
                          className="bg-[#013626] hover:bg-[#013626]/90 text-white px-6 py-2 rounded-lg font-semibold"
                        >
                          Book a Demo
                        </Button>
                        {expandedCourse === course.id ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Course Details - Expandable */}
                  {expandedCourse === course.id && (
                    <div className="px-6 pb-6 border-t border-slate-100">
                      <div className="pt-6 grid md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-primary-600" />
                              <span className="font-semibold text-slate-700">
                                Duration
                              </span>
                            </div>
                            <p className="text-slate-600">{course.duration}</p>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-primary-600" />
                              <span className="font-semibold text-slate-700">
                                Timings
                              </span>
                            </div>
                            <p className="text-slate-600">{course.timings}</p>
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <div className="mb-4">
                            <h4 className="font-semibold text-slate-700 mb-2">
                              Description
                            </h4>
                            <p className="text-slate-600 leading-relaxed">
                              {course.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-primary-50 border-primary-200 rounded-2xl card-hover">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Ready to Start Your Islamic Learning Journey?
              </h3>
              <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
                Join thousands of students worldwide in authentic Islamic
                education through personalized online classes with certified
                instructors.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => onEnrollClick(0)}
                  className="bg-primary-600 hover:bg-primary-700 rounded-2xl button-hover text-lg px-8 py-3"
                >
                  Book a Demo
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-primary-600 text-primary-600 hover:bg-primary-50 rounded-2xl button-hover text-lg px-8 py-3"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Free Consultation
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <ConsultationForm onClose={() => {}} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
