// Firebase Realtime Database service for form submissions
import { useToast } from "@/hooks/use-toast";

interface FormSubmissionResponse {
  success: boolean;
  message: string;
  id?: string;
  error?: string;
}

export const useFirebaseRTDB = () => {
  const { toast } = useToast();

  const submitEnrollment = async (data: any): Promise<FormSubmissionResponse> => {
    try {
      const response = await fetch('/api/submit-enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error submitting enrollment:', error);
      const errorMessage = "Failed to submit enrollment. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, message: errorMessage };
    }
  };

  const submitBookDemo = async (data: any): Promise<FormSubmissionResponse> => {
    try {
      const response = await fetch('/api/submit-book-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      // Don't show toast here - let the component handle it for custom success messages
      return result;
    } catch (error) {
      console.error('Error submitting demo booking:', error);
      const errorMessage = "Failed to submit demo booking. Please try again.";
      return { success: false, message: errorMessage };
    }
  };

  const submitContact = async (data: any): Promise<FormSubmissionResponse> => {
    try {
      const response = await fetch('/api/submit-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error submitting contact form:', error);
      const errorMessage = "Failed to submit contact form. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, message: errorMessage };
    }
  };

  const submitReview = async (data: any): Promise<FormSubmissionResponse> => {
    try {
      const response = await fetch('/api/submit-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMessage = "Failed to submit review. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, message: errorMessage };
    }
  };

  const getApprovedReviews = async () => {
    try {
      const response = await fetch('/api/approved-reviews');
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return await response.json();
    } catch (error) {
      console.error('Error fetching approved reviews:', error);
      return [];
    }
  };



  const getEnrollments = async () => {
    try {
      const response = await fetch('/api/enrollments');
      if (!response.ok) throw new Error('Failed to fetch enrollments');
      return await response.json();
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      return [];
    }
  };

  const getContactForms = async () => {
    try {
      const response = await fetch('/api/contact-forms');
      if (!response.ok) throw new Error('Failed to fetch contact forms');
      return await response.json();
    } catch (error) {
      console.error('Error fetching contact forms:', error);
      return [];
    }
  };

  const updateEnrollmentStatus = async (id: string, status: string): Promise<FormSubmissionResponse> => {
    try {
      const response = await fetch(`/api/enrollments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      const errorMessage = "Failed to update enrollment status. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, message: errorMessage };
    }
  };

  const updateContactStatus = async (id: string, status: string): Promise<FormSubmissionResponse> => {
    try {
      const response = await fetch(`/api/contact-forms/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error updating contact status:', error);
      const errorMessage = "Failed to update contact status. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, message: errorMessage };
    }
  };

  const submitConsultation = async (data: any): Promise<FormSubmissionResponse> => {
    try {
      const response = await fetch('/api/submit-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error submitting consultation:', error);
      const errorMessage = "Failed to submit consultation request. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, message: errorMessage };
    }
  };

  const submitRole = async (data: any): Promise<FormSubmissionResponse> => {
    try {
      const response = await fetch('/api/submit-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error submitting role proposal:', error);
      const errorMessage = "Failed to submit role proposal. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, message: errorMessage };
    }
  };

  const submitNewsletter = async (data: any): Promise<FormSubmissionResponse> => {
    try {
      const response = await fetch('/api/submit-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error submitting newsletter subscription:', error);
      const errorMessage = "Failed to subscribe to newsletter. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, message: errorMessage };
    }
  };

  const getConsultations = async () => {
    try {
      const response = await fetch('/api/consultations');
      if (!response.ok) throw new Error('Failed to fetch consultations');
      return await response.json();
    } catch (error) {
      console.error('Error fetching consultations:', error);
      return [];
    }
  };

  const getProposedRoles = async () => {
    try {
      const response = await fetch('/api/proposed-roles');
      if (!response.ok) throw new Error('Failed to fetch proposed roles');
      return await response.json();
    } catch (error) {
      console.error('Error fetching proposed roles:', error);
      return [];
    }
  };

  const getNewsletterSubscribers = async () => {
    try {
      const response = await fetch('/api/newsletter-subscribers');
      if (!response.ok) throw new Error('Failed to fetch newsletter subscribers');
      return await response.json();
    } catch (error) {
      console.error('Error fetching newsletter subscribers:', error);
      return [];
    }
  };

  const submitDonation = async (data: any): Promise<FormSubmissionResponse> => {
    try {
      const response = await fetch('/api/submit-donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error submitting donation:', error);
      const errorMessage = "Failed to submit donation request. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, message: errorMessage };
    }
  };

  // Admin functions for review approval
  const getPendingReviews = async () => {
    try {
      const response = await fetch('/api/admin/reviews/pending');
      if (!response.ok) throw new Error('Failed to fetch pending reviews');
      return await response.json();
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      return [];
    }
  };

  const approveReview = async (reviewId: string): Promise<FormSubmissionResponse> => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error approving review:', error);
      const errorMessage = "Failed to approve review. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, message: errorMessage };
    }
  };

  const deleteReview = async (reviewId: string): Promise<FormSubmissionResponse> => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting review:', error);
      const errorMessage = "Failed to delete review. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, message: errorMessage };
    }
  };

  return {
    submitEnrollment,
    submitBookDemo,
    submitContact,
    submitReview,
    submitConsultation,
    submitRole,
    submitNewsletter,
    submitDonation,
    getApprovedReviews,
    getPendingReviews,
    approveReview,
    deleteReview,
    getEnrollments,
    getContactForms,
    getConsultations,
    getProposedRoles,
    getNewsletterSubscribers,
    updateEnrollmentStatus,
    updateContactStatus
  };
};