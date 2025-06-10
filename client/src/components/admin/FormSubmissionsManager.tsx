import { useState, useEffect } from "react";
import { getFormSubmissions, updateApprovalStatus } from "@/lib/firebaseSubmission";
import { type FormType } from "@/lib/formSchemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FormSubmission {
  id: string;
  approved: boolean;
  timestamp: any;
  submittedAt: string;
  [key: string]: any;
}

const formTabs: { value: FormType; label: string; description: string }[] = [
  { value: "reviews", label: "Reviews", description: "Customer reviews and testimonials" },
  { value: "contactMessages", label: "Contact Messages", description: "General contact form submissions" },
  { value: "bookDemos", label: "Demo Bookings", description: "Course demo booking requests" },
  { value: "freeConsultations", label: "Consultations", description: "Free consultation requests" },
  { value: "enrollment", label: "Enrollments", description: "Course enrollment applications" },
  { value: "proposedRoles", label: "Job Applications", description: "Proposed role submissions" },
  { value: "newsletterSubscribers", label: "Newsletter", description: "Newsletter subscriptions" },
];

export default function FormSubmissionsManager() {
  const [submissions, setSubmissions] = useState<Record<FormType, FormSubmission[]>>({
    reviews: [],
    contactMessages: [],
    bookDemos: [],
    freeConsultations: [],
    enrollment: [],
    proposedRoles: [],
    newsletterSubscribers: [],
  });
  const [loading, setLoading] = useState<Record<FormType, boolean>>({
    reviews: false,
    contactMessages: false,
    bookDemos: false,
    freeConsultations: false,
    enrollment: false,
    proposedRoles: false,
    newsletterSubscribers: false,
  });
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const { toast } = useToast();

  const loadSubmissions = async (formType: FormType) => {
    setLoading(prev => ({ ...prev, [formType]: true }));
    try {
      const data = await getFormSubmissions(formType);
      setSubmissions(prev => ({ ...prev, [formType]: data }));
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to load ${formType} submissions`,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [formType]: false }));
    }
  };

  const handleApprovalChange = async (formType: FormType, submissionId: string, approved: boolean) => {
    try {
      const result = await updateApprovalStatus(formType, submissionId, approved);
      
      if (result.success) {
        setSubmissions(prev => ({
          ...prev,
          [formType]: prev[formType].map(sub => 
            sub.id === submissionId ? { ...sub, approved } : sub
          )
        }));
        
        toast({
          title: "Success",
          description: `Submission ${approved ? 'approved' : 'rejected'}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update approval status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating the submission",
        variant: "destructive",
      });
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    
    let date: Date;
    if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getStatusBadge = (approved: boolean | undefined) => {
    if (approved === true) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
    } else if (approved === false) {
      return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Form Submissions</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage all form submissions from your website</p>
      </div>

      <Tabs defaultValue="reviews" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          {formTabs.map((tab) => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value}
              onClick={() => loadSubmissions(tab.value)}
              className="text-xs"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {formTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{tab.label}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{tab.description}</p>
                  </div>
                  <Button 
                    onClick={() => loadSubmissions(tab.value)}
                    disabled={loading[tab.value]}
                  >
                    {loading[tab.value] ? "Loading..." : "Refresh"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading[tab.value] ? (
                  <div className="text-center py-8">Loading submissions...</div>
                ) : submissions[tab.value].length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No submissions found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Name/Email</TableHead>
                        <TableHead>Preview</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions[tab.value].map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>{getStatusBadge(submission.approved)}</TableCell>
                          <TableCell>{formatDate(submission.submittedAt || submission.timestamp)}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{submission.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{submission.email || 'N/A'}</div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {submission.message || submission.comment || submission.subject || 'No preview'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setSelectedSubmission(submission)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>{tab.label} Submission Details</DialogTitle>
                                  </DialogHeader>
                                  {selectedSubmission && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <strong>Status:</strong> {getStatusBadge(selectedSubmission.approved)}
                                        </div>
                                        <div>
                                          <strong>Submitted:</strong> {formatDate(selectedSubmission.submittedAt || selectedSubmission.timestamp)}
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        {Object.entries(selectedSubmission)
                                          .filter(([key]) => !['id', 'approved', 'timestamp', 'submittedAt', 'approvedAt'].includes(key))
                                          .map(([key, value]) => (
                                          <div key={key} className="border-b pb-2">
                                            <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</strong>
                                            <div className="mt-1">
                                              {typeof value === 'object' ? JSON.stringify(value, null, 2) : value?.toString() || 'N/A'}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              
                              {submission.approved !== true && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => handleApprovalChange(tab.value, submission.id, true)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              
                              {submission.approved !== false && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleApprovalChange(tab.value, submission.id, false)}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}