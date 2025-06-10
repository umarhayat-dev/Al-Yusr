import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Video, MessageCircle, HelpCircle, Send, User, Clock } from 'lucide-react';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [replacementReason, setReplacementReason] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  // Student session data
  const student = {
    name: "Sarah Ahmed",
    email: "sarah.ahmed@gmail.com",
    enrolledCourses: 2,
    attendanceRate: 92
  };

  // Next class data
  const nextClass = {
    course: "Quran for Beginners",
    teacher: "Dr. Muhammad Hassan",
    date: "Today",
    time: "07:00 AM CT",
    duration: "60 minutes",
    canJoin: true,
    meetingLink: "meet.google.com/abc-def-ghi"
  };

  // Calendar events
  const calendarEvents = [
    { date: "Jan 22", day: "Mon", course: "Quran Basics", time: "7:00 AM", status: "ready" },
    { date: "Jan 24", day: "Wed", course: "Arabic Grammar", time: "3:00 PM", status: "scheduled" },
    { date: "Jan 25", day: "Thu", course: "Quran Basics", time: "7:00 AM", status: "scheduled" },
    { date: "Jan 27", day: "Sat", course: "Arabic Grammar", time: "3:00 PM", status: "scheduled" },
  ];

  // Chat messages
  const [chatHistory, setChatHistory] = useState([
    { sender: "Dr. Hassan", message: "Great progress on your Tajweed today!", time: "10:30 AM" },
    { sender: "You", message: "Thank you! I have a question about the pronunciation of 'Qaf'", time: "10:35 AM" },
    { sender: "Dr. Hassan", message: "Of course! Let's practice that in our next session.", time: "10:40 AM" },
  ]);

  // Makeup class requests
  const makeupRequests = [
    { course: "Quran Basics", requestDate: "Jan 20", reason: "Family emergency", status: "Approved", newDate: "Jan 28" },
    { course: "Arabic Grammar", requestDate: "Jan 18", reason: "Work conflict", status: "Pending", newDate: "-" },
  ];

  const handleJoinClass = () => {
    if (nextClass.canJoin) {
      alert(`Joining ${nextClass.course} class. Attendance marked as Present!`);
      window.open(nextClass.meetingLink, '_blank');
    } else {
      alert("Class is not ready to join yet. Please wait until 10 minutes before start time.");
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        sender: "You",
        message: chatMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory([...chatHistory, newMessage]);
      setChatMessage('');
      
      // Simulate teacher response
      setTimeout(() => {
        const teacherResponse = {
          sender: "Dr. Hassan",
          message: "Thank you for your message! I'll get back to you soon.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory(prev => [...prev, teacherResponse]);
      }, 2000);
    }
  };

  const handleRequestMakeUp = () => {
    if (!selectedCourse || !replacementReason.trim()) {
      alert("Please select a course and provide a reason for the replacement request.");
      return;
    }
    
    alert(`Replacement class request submitted for ${selectedCourse}. Your teacher will review your request.`);
    setShowReplacementModal(false);
    setReplacementReason('');
    setSelectedCourse('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600">Welcome back, {student.name}!</p>
          <div className="mt-2 text-sm text-green-600">
            ✅ Session Active • {student.attendanceRate}% Attendance Rate
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="makeup">Makeup Classes</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Next Class Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Next Class</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-6 border rounded-lg bg-blue-50">
                      <div>
                        <h3 className="text-xl font-bold text-blue-900">{nextClass.course}</h3>
                        <p className="text-blue-700 font-medium">{nextClass.teacher}</p>
                        <p className="text-blue-600">{nextClass.date} at {nextClass.time}</p>
                        <p className="text-blue-600 text-sm">Duration: {nextClass.duration}</p>
                      </div>
                      <Button 
                        size="lg"
                        onClick={handleJoinClass}
                        disabled={!nextClass.canJoin}
                        className={nextClass.canJoin ? "bg-green-600 hover:bg-green-700 text-lg px-8 py-4" : ""}
                      >
                        <Video className="mr-2 h-5 w-5" />
                        {nextClass.canJoin ? "Join Class" : "Not Ready"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Calendar View */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      This Week's Classes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {calendarEvents.map((event, index) => (
                        <div key={index} className={`p-3 border rounded-lg ${event.status === 'ready' ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{event.course}</p>
                              <p className="text-xs text-gray-600">{event.day}, {event.date}</p>
                              <p className="text-xs text-gray-600">{event.time}</p>
                            </div>
                            <Badge variant={event.status === 'ready' ? 'default' : 'secondary'} className="text-xs">
                              {event.status === 'ready' ? 'Ready' : 'Scheduled'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                      onClick={handleJoinClass}
                      disabled={!nextClass.canJoin}
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Join Class
                    </Button>
                    <Button 
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => setShowChatModal(true)}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Chat with Teacher
                    </Button>
                    <Button 
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => setShowReplacementModal(true)}
                    >
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Request Replacement Class
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="makeup" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Request New Makeup */}
              <Card>
                <CardHeader>
                  <CardTitle>Request Replacement Class</CardTitle>
                  <CardDescription>Submit a request for a missed class</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="course">Select Course</Label>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Quran for Beginners">Quran for Beginners</SelectItem>
                        <SelectItem value="Arabic Grammar">Arabic Grammar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason for Replacement Request</Label>
                    <Textarea
                      id="reason"
                      placeholder="Please explain why you need a replacement class..."
                      value={replacementReason}
                      onChange={(e) => setReplacementReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleRequestMakeUp} className="w-full">
                    Submit Request
                  </Button>
                </CardContent>
              </Card>

              {/* Previous Requests */}
              <Card>
                <CardHeader>
                  <CardTitle>Previous Requests</CardTitle>
                  <CardDescription>Your replacement class request history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {makeupRequests.map((request, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{request.course}</p>
                            <p className="text-sm text-gray-600">Requested: {request.requestDate}</p>
                            <p className="text-sm text-gray-600">Reason: {request.reason}</p>
                            {request.newDate !== '-' && (
                              <p className="text-sm text-green-600">New Date: {request.newDate}</p>
                            )}
                          </div>
                          <Badge variant={request.status === 'Approved' ? 'default' : 'secondary'}>
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chat with Your Teachers</CardTitle>
                <CardDescription>Send messages to your instructors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Chat History */}
                  <div className="h-96 border rounded-lg p-4 overflow-y-auto bg-gray-50">
                    <div className="space-y-3">
                      {chatHistory.map((message, index) => (
                        <div key={index} className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender === 'You' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-white border'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-3 w-3" />
                              <span className="text-xs font-medium">{message.sender}</span>
                              <span className="text-xs opacity-70">{message.time}</span>
                            </div>
                            <p className="text-sm">{message.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Replacement Class Request Modal */}
      <Dialog open={showReplacementModal} onOpenChange={setShowReplacementModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Replacement Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="course">Select Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Quran for Beginners">Quran for Beginners</SelectItem>
                  <SelectItem value="Arabic Grammar">Arabic Grammar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reason">Reason for Replacement Request</Label>
              <Textarea
                id="reason"
                placeholder="Please explain why you need a replacement class..."
                value={replacementReason}
                onChange={(e) => setReplacementReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRequestMakeUp} className="flex-1">
                Submit Request
              </Button>
              <Button variant="outline" onClick={() => setShowReplacementModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Modal */}
      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chat with Dr. Hassan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="h-64 border rounded-lg p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-3">
                {chatHistory.slice(-5).map((message, index) => (
                  <div key={index} className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.sender === 'You' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3 w-3" />
                        <span className="text-xs font-medium">{message.sender}</span>
                        <span className="text-xs opacity-70">{message.time}</span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}