import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar as CalendarIcon,
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  MessageCircle,
  FileText,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { ref, onValue } from "firebase/database";
import { rtdb } from "@/lib/firebase";

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [classNote, setClassNote] = useState("");
  const [teacherData, setTeacherData] = useState<any>(null);
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);

  // Get current teacher serial from localStorage or default
  const getCurrentTeacherSerial = () => {
    const savedUser = localStorage.getItem("alyusr-user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === "teacher" && user.serial) {
        return user.serial;
      }
    }
    return "TE013"; // Default fallback
  };

  const currentTeacherSerial = getCurrentTeacherSerial();

  // Fetch teacher data from Firebase users table
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const usersRef = ref(rtdb, "users");
        onValue(usersRef, (snapshot) => {
          const users = snapshot.val();
          if (users) {
            const teacher = Object.values(users).find(
              (user: any) =>
                user.serial === currentTeacherSerial && user.role === "Teacher",
            );
            if (teacher) {
              setTeacherData(teacher);
            }
          }
        });
      } catch (error) {
        console.error("Error fetching teacher data:", error);
      }
    };

    fetchTeacherData();
  }, [currentTeacherSerial]);

  // Fetch students assigned to this teacher from active-students table
  useEffect(() => {
    const fetchMyStudents = async () => {
      try {
        const activeStudentsRef = ref(rtdb, "active-students");
        onValue(activeStudentsRef, (snapshot) => {
          const students = snapshot.val();
          if (students) {
            const assignedStudents = Object.values(students).filter(
              (student: any) => student["te-serial"] === currentTeacherSerial,
            );
            setAssignedStudents(assignedStudents);
          }
        });
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchMyStudents();
  }, [currentTeacherSerial]);

  // Fetch teacher notes from Google Sheets
  const { data: notes = [] } = useQuery({
    queryKey: ["teacher-notes", currentTeacherSerial],
    queryFn: async () => {
      const res = await fetch(`/api/teacher-notes/${currentTeacherSerial}`);
      return res.json();
    },
    enabled: !!currentTeacherSerial, // prevent call if undefined
    refetchInterval: 30000,
  });

  // Teacher data with real information
  const teacher = teacherData || {
    name: teacherData?.name || "Teacher",
    email: teacherData?.email || "",
    specialty: teacherData?.courses || "",
  };

  // Get teacher name for welcome message
  const teacherName = teacherData?.name || "Teacher";

  // Convert assigned students to display format - showing student names instead of emails
  const myStudents = assignedStudents.map((student: any, index: number) => ({
    id: index + 1,
    name: student["student-name"] || student["st-name"] || "Student",
    email: student["st-email"] || "",
    serial: student["st-serial"] || "",
    courses: [student["course-code"] || student["st-course"] || ""],
    progress: Math.floor(Math.random() * 100),
    lastClass: new Date().toLocaleDateString(),
    attendance: "92%",
    status: student["status"] || "Active",
    notes:
      notes && Array.isArray(notes)
        ? notes.filter(
            (note: any) => note.studentSerial === student["st-serial"],
          )
        : [],
  }));

  // Sample makeup requests
  const makeupRequests = [
    {
      id: 1,
      student: "Sarah Ahmed",
      originalDate: "Jan 25",
      requestedDate: "Jan 28",
      reason: "Family emergency",
      status: "pending",
    },
  ];

  const handleAddNote = async () => {
    if (selectedStudent && classNote.trim()) {
      try {
        const response = await fetch("/api/submit-teacher-note", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teacherSerial: currentTeacherSerial,
            studentSerial: selectedStudent.serial,
            note: classNote,
          }),
        });

        if (response.ok) {
          alert(`Class note saved for ${selectedStudent.name}`);
          setClassNote("");
          setShowNoteModal(false);
          setSelectedStudent(null);
          // Refresh notes data
          window.location.reload();
        } else {
          alert("Failed to save note. Please try again.");
        }
      } catch (error) {
        console.error("Error saving note:", error);
        alert("Failed to save note. Please try again.");
      }
    }
  };

  const handleMakeupRequest = (
    requestId: number,
    action: "approve" | "reject",
  ) => {
    const request = makeupRequests.find((r) => r.id === requestId);
    if (request) {
      const actionText = action === "approve" ? "approved" : "rejected";
      alert(
        `Replacement class request for ${request.student} has been ${actionText}.`,
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600">Welcome back, {teacherName}!</p>
          <div className="mt-2 text-sm text-blue-600">
            ✅ Teaching {teacher.specialty} • {assignedStudents.length} Active
            Students
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">My Students</TabsTrigger>
            <TabsTrigger value="calendar">Schedule</TabsTrigger>
            <TabsTrigger value="makeup">Makeup Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats Section */}
              <div className="lg:col-span-2 space-y-6">
                {/* Teacher Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">
                            {assignedStudents.length}
                          </p>
                          <p className="text-sm text-gray-600">
                            Total Students
                          </p>
                        </div>
                        <Users className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">3</p>
                          <p className="text-sm text-gray-600">Total Courses</p>
                        </div>
                        <BookOpen className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Class Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Recent Class Notes
                    </CardTitle>
                    <CardDescription>
                      Your latest student progress notes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.isArray(notes) && notes.length > 0 ? (
                        notes.slice(0, 3).map((note: any) => (
                          <div
                            key={note.timestamp || `${note.teacherSerial}-${note.studentSerial}`}
                            className="border-l-4 border-blue-500 pl-4 py-2"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-semibold text-sm">
                                Student {note.studentSerial}
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const student = myStudents.find(
                                    (s) => s.serial === note.studentSerial,
                                  );
                                  if (student) {
                                    setSelectedStudent(student);
                                    setShowNoteModal(true);
                                  }
                                }}
                              >
                                <Edit className="w-4 h-4" />
                                Add Note
                              </Button>
                            </div>
                            <p className="text-sm text-gray-700 italic">"{note.note}"</p>
                            <p className="text-xs text-gray-500 mt-1">{note.date}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No class notes yet. Start adding notes for your students!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>

                </Card>
              </div>

              {/* Today's Classes */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5" />
                      Today's Classes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">Quran for Beginners</h4>
                          <Badge variant="secondary">07:00 AM</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          8 students • 60 min
                        </p>
                        <Button size="sm" className="mt-2 w-full">
                          Join Class
                        </Button>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">Tajweed Advanced</h4>
                          <Badge variant="secondary">03:00 PM</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          6 students • 60 min
                        </p>
                        <Button size="sm" className="mt-2 w-full">
                          Join Class
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message Students
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Eye className="w-4 h-4 mr-2" />
                      View All Notes
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Schedule Class
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Students ({myStudents.length})</CardTitle>
                <CardDescription>
                  Students assigned to your classes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myStudents.map((student: any) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{student.name}</h3>
                        <p className="text-sm text-gray-600">{student.email}</p>
                        <p className="text-sm text-gray-500">
                          Serial: {student.serial}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {student.courses.map(
                            (course: string, idx: number) => (
                              <Badge key={idx} variant="secondary">
                                {course}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowNoteModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Add Note
                        </Button>
                      </div>
                    </div>
                  ))}
                  {myStudents.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No students assigned yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Schedule</CardTitle>
                <CardDescription>Your weekly teaching schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Schedule view coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="makeup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Replacement Class Requests</CardTitle>
                <CardDescription>
                  Student requests for makeup classes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {makeupRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{request.student}</h3>
                          <p className="text-sm text-gray-600">
                            Original: {request.originalDate} → Requested:{" "}
                            {request.requestedDate}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Reason: {request.reason}
                          </p>
                        </div>
                        <Badge variant="outline">{request.status}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleMakeupRequest(request.id, "approve")
                          }
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleMakeupRequest(request.id, "reject")
                          }
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Note Modal */}
        <Dialog open={showNoteModal} onOpenChange={setShowNoteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Class Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Student</Label>
                <Input
                  value={selectedStudent?.name || ""}
                  disabled
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Class Note</Label>
                <Textarea
                  value={classNote}
                  onChange={(e) => setClassNote(e.target.value)}
                  placeholder="Enter your class note here..."
                  className="mt-1 min-h-[100px]"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddNote} className="flex-1">
                  Save Note
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNoteModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
