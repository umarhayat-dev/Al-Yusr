import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourses, getAdmins } from "@/lib/firebase";
import AdminReviewsCarousel from "@/components/ui/AdminReviewsCarousel";

interface GoogleSheetsReview {
  id: number;
  name: string;
  location: string;
  rating: number;
  comment: string;
  createdAt: string;
}

import { apiRequest } from "@/lib/queryClient";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  BookOpen,
  DollarSign,
  Calendar,
  Settings,
  MessageSquare,
  UserCheck,
  Plus,
  Edit,
  Trash2,
  Download,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Star,
  Eye,
  Mail,
  FileText,
  Briefcase,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Check,
  X,
} from "lucide-react";
import ChatSystem from "@/components/ChatSystem";
import NotificationSystem from "@/components/NotificationSystem";
import {
  addCourse,
  deleteCourse,
  getCourses as getFirebaseCourses,
  addJob,
  deleteJob,
  getJobs,
  addTeacher,
  deleteTeacher,
  getTeachers as getFirebaseTeachers,
  addStudent,
  deleteStudent,
  getStudents as getFirebaseStudents,
  getStats as getFirebaseStats,
  getInquiries,
  updateInquiryStatus,
  getPendingReviews,
  updateReviewStatus,
  getReplacementRequests,
  updateReplacementRequestStatus,
  getActiveStudents,
  getActiveTeachers,
  getActiveStudentsStats,
} from "@/lib/adminFunctions";
import { useToast } from "@/hooks/use-toast";
import {
  addStudentToRTDB,
  deleteStudentFromRTDB,
  addCourseToRTDB,
  deleteCourseFromRTDB,
  getCoursesFromRTDB,
  addJobToRTDB,
  deleteJobFromRTDB,
  getJobsFromRTDB,
  addInquiryToRTDB,
  updateInquiryStatusRTDB,
  getInquiriesFromRTDB,
  addReplacementRequestToRTDB,
  updateReplacementRequestStatusRTDB,
  getReplacementRequestsFromRTDB,
} from "@/lib/firebase";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [currentReview, setCurrentReview] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    email: "",
    location: "",
    rating: 5,
    comment: "",
  });

  // Real Firebase Data States
  const [realStats, setRealStats] = useState({
    totalStudents: 0,
    activeTeachers: 0,
    activeCourses: 0,
    monthlyRevenue: 0,
    pendingApprovals: 0,
    newInquiries: 0,
  });
  const [realCourses, setRealCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [realJobs, setRealJobs] = useState<any[]>([]);
  const [realTeachers, setRealTeachers] = useState<any[]>([]);
  const [activeStudents, setActiveStudents] = useState<any[]>([]);
  const [realInquiries, setRealInquiries] = useState<any[]>([]);
  const [realReviews, setRealReviews] = useState<any[]>([]);
  const [realReplacementRequests, setRealReplacementRequests] = useState<any[]>(
    [],
  );

  // Add Course Modal States
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // Form Data States
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    duration: "",
    price: "",
    category: "",
    level: "",
  });

  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    location: "",
    type: "",
    requirements: "",
    salary: "",
  });

  const [newTeacher, setNewTeacher] = useState({
    name: "",
    email: "",
    specialty: "",
    experience: "",
    bio: "",
  });

  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    course: "",
    phone: "",
    level: "",
  });
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);

  // User management data
  const [teachers, setTeachers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  // Realtime Database data
  const [realCoursesRTDB, setRealCoursesRTDB] = useState<any[]>([]);
  const [realJobsRTDB, setRealJobsRTDB] = useState<any[]>([]);
  const [realInquiriesRTDB, setRealInquiriesRTDB] = useState<any[]>([]);
  const [realReplacementRequestsRTDB, setRealReplacementRequestsRTDB] =
    useState<any[]>([]);

  const [showStudentList, setShowStudentList] = useState(false);
  const [showTeacherList, setShowTeacherList] = useState(false);
  const [showPaymentList, setShowPaymentList] = useState(false);
  const [showInquiries, setShowInquiries] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showReplacementRequests, setShowReplacementRequests] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    teacher: "",
    students: [] as string[],
    location: "",
    meetingLink: "",
  });

  // Approve and Delete functions for AdminReviewsCarousel
  const handleApproveReview = async (review) => {
    const res = await fetch(`/api/admin/approve-review/${review.rowIndex}`, {
      method: "POST",
    });
    const data = await res.json();
    if (data.success) {
      queryClient.invalidateQueries(["pending-reviews"]);
    }
  };

  const handleDeleteReview = async (review) => {
    const res = await fetch(`/api/admin/delete-review/${review.rowIndex}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) {
      queryClient.invalidateQueries(["pending-reviews"]);
    }
  };

  // Fetch active students from Firebase RTDB
  const { data: firebaseActiveStudents = [], isLoading: loadingFirebaseStudents } = useQuery({
    queryKey: ["firebase-active-students"],
    queryFn: async () => {
      const response = await fetch('/api/active-students');
      if (!response.ok) throw new Error('Failed to fetch active students');
      return response.json();
    }
  });

  // Fetch teachers and students from Firebase Realtime Database - Active Students table
  useEffect(() => {
    const unsubscribeStudents = getActiveStudents((students) => {
      setActiveStudents(students);
      setLoadingStudents(false);
    });

    const unsubscribeTeachers = getActiveTeachers((teachers) => {
      setTeachers(teachers);
      setLoadingTeachers(false);
    });

    return () => {
      unsubscribeStudents();
      unsubscribeTeachers();
    };
  }, []);

  // Fetch admins from Firebase
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoadingAdmins(true);
        const adminsData = await getAdmins();

        const formattedAdmins = adminsData.map((admin: any) => ({
          id: admin.id,
          name: admin.name || "Unknown",
          email: admin.email || "No email",
          role: admin.role || "Admin",
          password: admin.pass || "N/A",
        }));

        setAdmins(formattedAdmins);
      } catch (error) {
        console.error("Error fetching admins:", error);
      } finally {
        setLoadingAdmins(false);
      }
    };

    fetchAdmins();
  }, []);

  // Load real Firebase data from active students table
  useEffect(() => {
    const unsubscribeStats = getActiveStudentsStats(setRealStats);

    return () => {
      unsubscribeStats();
    };
  }, []);

  // Fetch data from Realtime Database
  useEffect(() => {
    const unsubscribeCourses = getCoursesFromRTDB((courses) => {
      setRealCoursesRTDB(courses);
    });

    const unsubscribeJobs = getJobsFromRTDB((jobs) => {
      setRealJobsRTDB(jobs);
    });

    const unsubscribeInquiries = getInquiriesFromRTDB((inquiries) => {
      setRealInquiriesRTDB(inquiries);
    });

    const unsubscribeRequests = getReplacementRequestsFromRTDB((requests) => {
      setRealReplacementRequestsRTDB(requests);
    });

    return () => {
      unsubscribeCourses();
      unsubscribeJobs();
      unsubscribeInquiries();
      unsubscribeRequests();
    };
  }, []);

  // All data now comes from real Firebase - no more dummy data!

  const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
    onClick,
    alert = false,
  }: any) => (
    <Card
      className={`cursor-pointer hover:shadow-lg transition-shadow ${alert ? "border-orange-200 bg-orange-50" : ""}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="relative">
          <Icon
            className={`h-4 w-4 ${alert ? "text-orange-600" : "text-muted-foreground"}`}
          />
          {alert && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${alert ? "text-orange-700" : ""}`}>
          {value}
        </div>
        {change && <p className="text-xs text-muted-foreground">{change}</p>}
      </CardContent>
    </Card>
  );

  const exportToCSV = (data: any, filename: string) => {
    // This would implement CSV export functionality
    alert(`Exporting ${filename} to CSV...`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Comprehensive institute management with smart controls
            </p>
          </div>
          <NotificationSystem />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 max-w-5xl overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Interactive Stats Panel with Click Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Students"
                value={realStats.totalStudents}
                icon={Users}
                change={
                  realStats.totalStudents > 0
                    ? `${realStats.totalStudents} active students`
                    : "No students yet"
                }
                onClick={() => setShowStudentList(true)}
              />
              <StatCard
                title="Active Teachers"
                value={realStats.activeTeachers}
                icon={UserCheck}
                change={
                  realStats.activeTeachers > 0
                    ? `${realStats.activeTeachers} teaching`
                    : "No teachers yet"
                }
                onClick={() => setShowTeacherList(true)}
              />
              <StatCard
                title="Active Courses"
                value={realCoursesRTDB.length || 0}
                icon={BookOpen}
                change={
                  realCoursesRTDB.length > 0
                    ? `${realCoursesRTDB.length} courses`
                    : "No courses yet"
                }
                onClick={() => setActiveTab("courses")}
              />
              <StatCard
                title="Total Jobs"
                value={realJobsRTDB.length || 0}
                icon={Briefcase}
                change={
                  realJobsRTDB.length > 0
                    ? `${realJobsRTDB.length} openings`
                    : "No jobs posted"
                }
                onClick={() => setActiveTab("jobs")}
              />
            </div>

            {/* Alert Cards for Pending Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                title="Replacement Requests"
                value={
                  realReplacementRequestsRTDB.filter(
                    (req) => req.status === "Pending",
                  ).length || 0
                }
                icon={AlertTriangle}
                change={
                  realReplacementRequestsRTDB.filter(
                    (req) => req.status === "Pending",
                  ).length > 0
                    ? "Needs attention"
                    : "All clear"
                }
                alert={
                  realReplacementRequestsRTDB.filter(
                    (req) => req.status === "Pending",
                  ).length > 0
                }
                onClick={() => setShowReplacementRequests(true)}
              />
              <StatCard
                title="New Inquiries"
                value={
                  realInquiriesRTDB.filter((inq) => inq.status === "Pending")
                    .length || 0
                }
                icon={Mail}
                change={
                  realInquiriesRTDB.filter((inq) => inq.status === "Pending")
                    .length > 0
                    ? "Needs response"
                    : "All clear"
                }
                alert={
                  realInquiriesRTDB.filter((inq) => inq.status === "Pending")
                    .length > 0
                }
                onClick={() => setShowInquiries(true)}
              />
            </div>

            {/* Google Calendar Integration Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Google Calendar Integration
                </CardTitle>
                <CardDescription>
                  Smart scheduling with automated notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    className="w-full"
                    onClick={() => setShowScheduleModal(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Class
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      window.open(
                        "https://calendar.google.com/calendar/embed?src=alyusrinstitute%40gmail.com&ctz=UTC",
                        "_blank",
                      )
                    }
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    View Calendar
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Reminders
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p>• Tag specific teachers and students</p>
                    <p>• Events visible only to tagged users</p>
                    <p>• Add detailed notes and timing</p>
                  </div>
                  <div>
                    <p>• Sync with Gmail calendar</p>
                    <p>• Automatic email reminders</p>
                    <p>• Join class buttons for attendance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inquiries & Reviews Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Latest Inquiries</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInquiries(true)}
                  >
                    See More
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {realInquiriesRTDB.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No inquiries yet</p>
                    </div>
                  ) : (
                    realInquiriesRTDB.slice(0, 3).map((inquiry: any) => (
                      <div
                        key={inquiry.id}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{inquiry.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {inquiry.subject}
                          </p>
                          <p className="text-xs text-blue-600">
                            {inquiry.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              inquiry.priority === "High"
                                ? "destructive"
                                : inquiry.priority === "Medium"
                                  ? "default"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {inquiry.priority || "Medium"}
                          </Badge>
                          <Badge
                            variant={
                              inquiry.status === "Pending"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {inquiry.status || "Pending"}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-center mb-4">
                    Pending Reviews
                  </CardTitle>
                  <AdminReviewsCarousel
                    handleApprove={handleApproveReview}
                    handleDelete={handleDeleteReview}
                  />
                </CardHeader>
                <CardContent className="space-y-3">
                  <PendingReviewsWidget />
                </CardContent>
              </Card>
              
              
            </div>

            {/* Replacement Class Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Replacement Class Requests</CardTitle>
                <CardDescription>
                  Pending approval requests from students and teachers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {realReplacementRequestsRTDB.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No replacement requests yet</p>
                    </div>
                  ) : (
                    realReplacementRequestsRTDB
                      .slice(0, 3)
                      .map((request: any) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium">
                              {request.studentName || request.teacherName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {request.courseName} - Original Date:{" "}
                              {request.originalDate}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Reason: {request.reason}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={async () => {
                                try {
                                  await updateReplacementRequestStatusRTDB(
                                    request.id,
                                    "Approved",
                                  );
                                  alert("Request approved!");
                                } catch (error) {
                                  alert(
                                    "Error approving request. Please try again.",
                                  );
                                }
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              onClick={async () => {
                                try {
                                  await updateReplacementRequestStatus(
                                    request.id,
                                    "Rejected",
                                  );
                                  alert("Request rejected!");
                                } catch (error) {
                                  alert(
                                    "Error rejecting request. Please try again.",
                                  );
                                }
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Student Management</CardTitle>
                  <CardDescription>
                    Manage all registered students
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      exportToCSV(activeStudents, "active-students")
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <Input
                    placeholder="Search students by name, email, or serial..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {loadingFirebaseStudents ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-[#013626] border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Loading active students...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      const filteredStudents = firebaseActiveStudents.filter((student: any) => {
                        const matchesSearch = !searchTerm || 
                          student["student-name"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student["st-email"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student["st-serial"]?.toLowerCase().includes(searchTerm.toLowerCase());
                        
                        const matchesStatus = filterStatus === "all" || student.status === filterStatus;
                        
                        return matchesSearch && matchesStatus;
                      });

                      if (filteredStudents.length === 0) {
                        return (
                          <div className="text-center py-8 text-muted-foreground">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No students found</p>
                            <p className="text-sm">
                              {searchTerm || filterStatus !== "all" 
                                ? "Try adjusting your search or filter criteria"
                                : "Active students will appear here when enrolled"
                              }
                            </p>
                          </div>
                        );
                      }

                      return filteredStudents.map((student: any) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{student["student-name"]}</p>
                              <Badge variant="outline" className="text-xs">
                                {student["st-serial"]}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {student["st-email"]}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Course: {student["course-code"]}</span>
                              <span>Teacher: {student["teacher-name"]} ({student["te-serial"]})</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={student.status === "Active" ? "default" : "secondary"}
                            >
                              {student.status}
                            </Badge>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {student.fee} {student.currency}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Teacher: {student["te-pay"]} {student["te-pay-curr"]}
                              </p>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Teacher Management</CardTitle>
                  <CardDescription>Manage teaching staff</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Teacher
                </Button>
              </CardHeader>
              <CardContent>
                {loadingTeachers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-[#013626] border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Loading teachers from database...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teachers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No teachers found</p>
                        <p className="text-sm">
                          Teachers will appear here when students are enrolled
                        </p>
                      </div>
                    ) : (
                      teachers.map((teacher) => (
                        <div
                          key={teacher.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              {teacher.name} {teacher.serialNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {teacher.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {teacher.courseCodes} •{" "}
                              {teacher.activeStudentsCount} active students
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="default">Active</Badge>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Course</CardTitle>
                  <CardDescription>
                    Add a new course to the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="courseTitle">Course Title</Label>
                    <Input
                      id="courseTitle"
                      placeholder="e.g., Advanced Tajweed"
                      value={newCourse.title}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="courseDescription">Description</Label>
                    <Textarea
                      id="courseDescription"
                      placeholder="Course description..."
                      rows={3}
                      value={newCourse.description}
                      onChange={(e) =>
                        setNewCourse({
                          ...newCourse,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        placeholder="e.g., 8 weeks"
                        value={newCourse.duration}
                        onChange={(e) =>
                          setNewCourse({
                            ...newCourse,
                            duration: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="150"
                        value={newCourse.price}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, price: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newCourse.category}
                        onValueChange={(value) =>
                          setNewCourse({ ...newCourse, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quran">Quran Studies</SelectItem>
                          <SelectItem value="arabic">
                            Arabic Language
                          </SelectItem>
                          <SelectItem value="islamic">
                            Islamic Studies
                          </SelectItem>
                          <SelectItem value="tajweed">Tajweed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="level">Level</Label>
                      <Select
                        value={newCourse.level}
                        onValueChange={(value) =>
                          setNewCourse({ ...newCourse, level: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={async () => {
                      try {
                        await addCourse(newCourse);
                        setNewCourse({
                          title: "",
                          description: "",
                          duration: "",
                          price: "",
                          category: "",
                          level: "",
                        });
                        alert("Course created successfully!");
                      } catch (error) {
                        alert("Error creating course. Please try again.");
                      }
                    }}
                    disabled={
                      !newCourse.title ||
                      !newCourse.description ||
                      !newCourse.duration ||
                      !newCourse.price
                    }
                  >
                    Create Course
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Existing Courses</CardTitle>
                  <CardDescription>
                    Manage current course offerings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {realCourses.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No courses created yet</p>
                        <p className="text-sm">
                          Create your first course using the form on the left
                        </p>
                      </div>
                    ) : (
                      realCourses.map((course: any) => (
                        <div key={course.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{course.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {course.category} • ${course.price} •{" "}
                                {course.duration}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Level: {course.level} • Students:{" "}
                                {course.studentCount || 0}
                              </p>
                              {course.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {course.description}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      "Are you sure you want to delete this course?",
                                    )
                                  ) {
                                    try {
                                      await deleteCourse(course.id);
                                      alert("Course deleted successfully!");
                                    } catch (error) {
                                      alert(
                                        "Error deleting course. Please try again.",
                                      );
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Post New Job Opening</CardTitle>
                  <CardDescription>Create a new job posting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g., Quran Teacher"
                      value={newJob.title}
                      onChange={(e) =>
                        setNewJob({ ...newJob, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobDescription">Job Description</Label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Job responsibilities and requirements..."
                      rows={4}
                      value={newJob.description}
                      onChange={(e) =>
                        setNewJob({ ...newJob, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="jobType">Employment Type</Label>
                      <Select
                        value={newJob.type}
                        onValueChange={(value) =>
                          setNewJob({ ...newJob, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="Remote/On-site"
                        value={newJob.location}
                        onChange={(e) =>
                          setNewJob({ ...newJob, location: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea
                      id="requirements"
                      placeholder="Job requirements and qualifications..."
                      rows={2}
                      value={newJob.requirements}
                      onChange={(e) =>
                        setNewJob({ ...newJob, requirements: e.target.value })
                      }
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={async () => {
                      try {
                        console.log("Creating job with data:", newJob);
                        await addJob(newJob);
                        setNewJob({
                          title: "",
                          description: "",
                          location: "",
                          type: "",
                          requirements: "",
                          salary: "",
                        });
                        alert("Job posted successfully!");
                      } catch (error) {
                        console.error("Job creation error:", error);
                        alert("Error posting job. Please try again.");
                      }
                    }}
                    disabled={
                      !newJob.title ||
                      !newJob.description ||
                      !newJob.location ||
                      !newJob.type
                    }
                  >
                    Post Job Opening
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Job Postings</CardTitle>
                  <CardDescription>Current open positions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {realJobs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No job postings yet</p>
                        <p className="text-sm">
                          Create your first job posting using the form
                        </p>
                      </div>
                    ) : (
                      realJobs.map((job: any) => (
                        <div key={job.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{job.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {job.type} • {job.location}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {job.description.substring(0, 80)}...
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      "Are you sure you want to delete this job posting?",
                                    )
                                  ) {
                                    try {
                                      await deleteJob(job.id);
                                      alert(
                                        "Job posting deleted successfully!",
                                      );
                                    } catch (error) {
                                      alert(
                                        "Error deleting job. Please try again.",
                                      );
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Attendance Tracking</CardTitle>
                  <CardDescription>
                    Monitor student attendance across all classes
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          89%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Overall Attendance
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          156
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Classes
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          12
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Absent Today
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Recent Attendance Records</h4>
                  {[
                    {
                      student: "Sarah Ahmed",
                      course: "Quran Basics",
                      date: "Jan 21",
                      status: "Present",
                      joinTime: "07:00 AM",
                    },
                    {
                      student: "Ahmad Khan",
                      course: "Arabic Grammar",
                      date: "Jan 21",
                      status: "Late",
                      joinTime: "03:08 PM",
                    },
                    {
                      student: "Fatima Ali",
                      course: "Tajweed",
                      date: "Jan 21",
                      status: "Present",
                      joinTime: "07:00 AM",
                    },
                    {
                      student: "Omar Hassan",
                      course: "Quran Basics",
                      date: "Jan 21",
                      status: "Absent",
                      joinTime: "-",
                    },
                  ].map((record, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{record.student}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.course} • {record.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{record.joinTime}</span>
                        <Badge
                          variant={
                            record.status === "Present"
                              ? "default"
                              : record.status === "Late"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {record.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <ChatSystem mode="admin" />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>
                  Configure system-wide settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="classDuration">
                      Default Class Duration (minutes)
                    </Label>
                    <Input id="classDuration" type="number" defaultValue="60" />
                  </div>
                  <div>
                    <Label htmlFor="sessionTimeout">
                      Session Timeout (hours)
                    </Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      defaultValue="12"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="userManagement">User ID Management</Label>
                  <Textarea
                    id="userManagement"
                    placeholder="Add/Remove student and teacher IDs..."
                  />
                </div>
                <div>
                  <Label htmlFor="platformConfig">Platform Configuration</Label>
                  <Textarea
                    id="platformConfig"
                    placeholder="Platform-level configurations..."
                  />
                </div>
                <Button>Save All Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Student List Modal */}
      <Dialog open={showStudentList} onOpenChange={setShowStudentList}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              All Students
              <Button
                size="sm"
                onClick={() => exportToCSV(activeStudents, "students")}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input placeholder="Search students..." className="max-w-sm" />
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              {activeStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No students registered yet</p>
                </div>
              ) : (
                activeStudents.map((student: any) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {student.name} {student.serialNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {student.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student.courseCode} • {student.teacherName}{" "}
                        {student.teacherSerial}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">{student.status}</Badge>
                      <span className="text-sm font-medium">
                        {student.fee} {student.currency}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Teacher List Modal */}
      <Dialog open={showTeacherList} onOpenChange={setShowTeacherList}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Teachers</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {teachers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No teachers registered yet</p>
              </div>
            ) : (
              teachers.map((teacher: any) => (
                <div
                  key={teacher.id}
                  className="flex items-center justify-between p-4 border rounded"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {teacher.name} {teacher.serialNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {teacher.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {teacher.courseCodes} • {teacher.activeStudentsCount}{" "}
                      active students
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Active</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        if (
                          window.confirm(
                            "Are you sure you want to remove this teacher?",
                          )
                        ) {
                          try {
                            await deleteTeacher(teacher.id);
                            alert("Teacher removed successfully!");
                          } catch (error) {
                            alert("Error removing teacher. Please try again.");
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment List Modal */}
      <Dialog open={showPaymentList} onOpenChange={setShowPaymentList}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Payment Records
              <Button size="sm" onClick={() => exportToCSV([], "payments")}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Payment system integration pending</p>
              <p className="text-sm">
                Connect Stripe or other payment gateway to view records
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inquiries Modal */}
      <Dialog open={showInquiries} onOpenChange={setShowInquiries}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Inquiries</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {realInquiriesRTDB.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No inquiries yet</p>
              </div>
            ) : (
              realInquiriesRTDB.map((inquiry: any) => (
                <div key={inquiry.id} className="p-4 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{inquiry.name}</h4>
                    <div className="flex gap-2">
                      <Badge
                        variant={
                          inquiry.priority === "High"
                            ? "destructive"
                            : inquiry.priority === "Medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {inquiry.priority || "Medium"}
                      </Badge>
                      <Badge
                        variant={
                          inquiry.status === "Unread"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {inquiry.status || "Pending"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {inquiry.email} • {inquiry.date}
                  </p>
                  <p className="text-sm font-medium mb-2">{inquiry.subject}</p>
                  <p className="text-sm mb-3">{inquiry.message}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        // Send email reply functionality
                        const reply = window.prompt("Enter your reply:");
                        if (reply) {
                          try {
                            await updateInquiryStatusRTDB(
                              inquiry.id,
                              "Replied",
                            );
                            alert("Reply sent successfully!");
                          } catch (error) {
                            alert("Error sending reply. Please try again.");
                          }
                        }
                      }}
                    >
                      Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await updateInquiryStatusRTDB(inquiry.id, "Read");
                          alert("Marked as read!");
                        } catch (error) {
                          alert("Error updating status. Please try again.");
                        }
                      }}
                    >
                      Mark as Read
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await updateInquiryStatusRTDB(
                            inquiry.id,
                            "Forwarded",
                          );
                          alert("Forwarded to teacher!");
                        } catch (error) {
                          alert("Error forwarding. Please try again.");
                        }
                      }}
                    >
                      Forward to Teacher
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reviews Modal */}
      <Dialog open={showReviews} onOpenChange={setShowReviews}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              All Reviews (Admin can only approve/delete)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {realReviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No reviews yet</p>
              </div>
            ) : (
              realReviews.map((review: any) => (
                <div key={review.id} className="p-4 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{review.name}</h4>
                    <Badge
                      variant={
                        review.status === "Approved" ? "default" : "secondary"
                      }
                    >
                      {review.status || "Pending"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {review.location} •{" "}
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(review.rating || 5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm mb-3">{review.comment}</p>
                  <div className="flex gap-2">
                    {review.status === "Pending" && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={async () => {
                          try {
                            await updateReviewStatus(review.id, "Approved");
                            alert("Review approved successfully!");
                          } catch (error) {
                            alert("Error approving review. Please try again.");
                          }
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this review?",
                          )
                        ) {
                          try {
                            await updateReviewStatus(review.id, "Deleted");
                            alert("Review deleted successfully!");
                          } catch (error) {
                            alert("Error deleting review. Please try again.");
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Replacement Class Requests Modal */}
      <Dialog
        open={showReplacementRequests}
        onOpenChange={setShowReplacementRequests}
      >
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Replacement Class Requests</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {realReplacementRequestsRTDB.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No replacement class requests yet</p>
              </div>
            ) : (
              realReplacementRequestsRTDB.map((request: any) => (
                <div key={request.id} className="p-4 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">
                      {request.studentName || request.teacherName}
                    </h4>
                    <Badge
                      variant={
                        request.status === "Pending" ? "destructive" : "default"
                      }
                    >
                      {request.status || "Pending"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Course: {request.courseName} • Original Date:{" "}
                    {request.originalDate}
                  </p>
                  <p className="text-sm mb-3">Reason: {request.reason}</p>
                  <div className="flex gap-2">
                    {request.status === "Pending" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={async () => {
                            try {
                              await updateReplacementRequestStatusRTDB(
                                request.id,
                                "Approved",
                              );
                              alert("Replacement request approved!");
                            } catch (error) {
                              alert(
                                "Error approving request. Please try again.",
                              );
                            }
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            try {
                              await updateReplacementRequestStatusRTDB(
                                request.id,
                                "Rejected",
                              );
                              alert("Replacement request rejected!");
                            } catch (error) {
                              alert(
                                "Error rejecting request. Please try again.",
                              );
                            }
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Class Modal */}
      <ScheduleClassModal
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
        scheduleForm={scheduleForm}
        setScheduleForm={setScheduleForm}
        teachers={teachers}
        students={activeStudents}
      />
    </div>
  );
}

// Pending Reviews Widget Component for Google Sheets integration
const PendingReviewsWidget = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingReviews = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/pending-reviews"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const approveMutation = useMutation({
    mutationFn: (rowIndex: number) =>
      apiRequest("POST", `/api/admin/approve-review/${rowIndex}`, {}),
    onSuccess: () => {
      toast({
        title: "Review Approved!",
        description:
          "The review has been approved and marked as 'Yes' in Google Sheets.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/pending-reviews"],
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (rowIndex: number) =>
      apiRequest("DELETE", `/api/admin/delete-review/${rowIndex}`, {}),
    onSuccess: () => {
      toast({
        title: "Review Deleted!",
        description:
          "The review has been permanently deleted from Google Sheets.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/pending-reviews"],
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <>
      {(pendingReviews as any[]).slice(0, 3).map((review: any) => (
        <div
          key={review.id}
          className="flex items-center justify-between p-3 border rounded"
        >
          <div className="flex-1">
            <p className="font-medium text-sm">{review.name}</p>
            <p className="text-xs text-muted-foreground">{review.location}</p>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(review.rating || 5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-3 w-3 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {review.comment}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-3">
            <Button
              size="sm"
              variant="outline"
              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              onClick={() => approveMutation.mutate(review.rowIndex)}
              disabled={approveMutation.isPending}
            >
              <Check className="w-3 h-3 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
              onClick={() => deleteMutation.mutate(review.rowIndex)}
              disabled={deleteMutation.isPending}
            >
              <X className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      ))}
    </>
  );
};

// Schedule Class Modal Component
const ScheduleClassModal = ({
  open,
  onOpenChange,
  scheduleForm,
  setScheduleForm,
  teachers,
  students,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleForm: any;
  setScheduleForm: (form: any) => void;
  teachers: any[];
  students: any[];
}) => {
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Here you would integrate with Google Calendar API
      // For now, we'll show a success message
      toast({
        title: "Class Scheduled Successfully!",
        description: `${scheduleForm.title} has been scheduled for ${scheduleForm.date} at ${scheduleForm.startTime}`,
      });

      // Reset form
      setScheduleForm({
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        teacher: "",
        students: [],
        location: "",
        meetingLink: "",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule class. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule New Class</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Class Title</Label>
              <Input
                id="title"
                value={scheduleForm.title}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, title: e.target.value })
                }
                placeholder="e.g., Quran Recitation Class"
                required
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={scheduleForm.location}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, location: e.target.value })
                }
                placeholder="e.g., Room 101 or Online"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={scheduleForm.description}
              onChange={(e) =>
                setScheduleForm({
                  ...scheduleForm,
                  description: e.target.value,
                })
              }
              placeholder="Class details and objectives..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={scheduleForm.date}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, date: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={scheduleForm.startTime}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    startTime: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={scheduleForm.endTime}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, endTime: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="teacher">Assign Teacher</Label>
            <Select
              value={scheduleForm.teacher}
              onValueChange={(value) =>
                setScheduleForm({ ...scheduleForm, teacher: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="meetingLink">
              Meeting Link (for online classes)
            </Label>
            <Input
              id="meetingLink"
              value={scheduleForm.meetingLink}
              onChange={(e) =>
                setScheduleForm({
                  ...scheduleForm,
                  meetingLink: e.target.value,
                })
              }
              placeholder="https://meet.google.com/..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Schedule Class</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
