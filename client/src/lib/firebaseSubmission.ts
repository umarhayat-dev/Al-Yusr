import { formSchemas, type FormType, type FormData } from "./formSchemas";
import { useToast } from "@/hooks/use-toast";

// Interface for submission response
interface SubmissionResponse {
  success: boolean;
  message: string;
  id?: string;
}

// Retry configuration
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 5000,  // 5 seconds
};

// Sleep utility for retry delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Calculate exponential backoff delay
const getRetryDelay = (attempt: number): number => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
};

// Core submission function with retry logic
async function submitWithRetry(
  formType: FormType,
  validatedData: FormData,
  attempt = 1
): Promise<SubmissionResponse> {
  console.log(`Server submission attempt ${attempt} for ${formType}:`, validatedData);
  
  try {
    // Submit to server-side Firebase endpoint
    const response = await fetch('/api/submit-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formType,
        data: validatedData
      })
    });

    const result = await response.json();
    console.log("Server response:", result);

    if (!response.ok) {
      throw new Error(result.message || 'Server error');
    }
    
    return {
      success: true,
      message: result.message || "Form submitted successfully!",
      id: result.id,
    };
  } catch (error: any) {
    console.error(`Submission attempt ${attempt} failed:`, error);
    
    // If we haven't reached max attempts, retry
    if (attempt < RETRY_CONFIG.maxAttempts) {
      const delay = getRetryDelay(attempt - 1);
      console.log(`Retrying in ${delay}ms...`);
      await sleep(delay);
      return submitWithRetry(formType, validatedData, attempt + 1);
    }
    
    // All attempts failed
    return {
      success: false,
      message: `Submission failed after ${RETRY_CONFIG.maxAttempts} attempts. Please try again later.`,
    };
  }
}

// Main submission function
export async function submitToFirebase(
  formType: FormType,
  data: any
): Promise<SubmissionResponse> {
  console.log("=== Starting Firebase submission ===");
  console.log("Form type:", formType);
  console.log("Form data:", data);
  
  try {
    // Get the appropriate schema for validation
    const schema = formSchemas[formType];
    console.log("Schema found:", !!schema);
    
    if (!schema) {
      console.error("No schema found for form type:", formType);
      return {
        success: false,
        message: "Invalid form type specified.",
      };
    }

    // Validate data using Zod schema
    console.log("Validating data with Zod...");
    const validationResult = schema.safeParse(data);
    
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.errors);
      const firstError = validationResult.error.errors[0];
      return {
        success: false,
        message: firstError?.message || "Please check your form data and try again.",
      };
    }

    console.log("Validation successful, validated data:", validationResult.data);

    // Submit validated data with retry logic
    console.log("Starting submission with retry logic...");
    const result = await submitWithRetry(formType, validationResult.data);
    console.log("=== Submission complete ===", result);
    return result;
    
  } catch (error: any) {
    console.error("Unexpected error in submitToFirebase:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

// Hook for easy form submission with toast notifications
export function useFormSubmission() {
  const { toast } = useToast();

  const submitForm = async (formType: FormType, data: any) => {
    try {
      const result = await submitToFirebase(formType, data);
      
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
      const errorMessage = "An unexpected error occurred. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  return { submitForm };
}

// Utility function to get all submissions for admin dashboard
export async function getFormSubmissions(formType: FormType) {
  try {
    const { get } = await import("firebase/database");
    const formsRef = ref(rtdb, `forms/${formType}`);
    const snapshot = await get(formsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Convert object to array with IDs
      return Object.entries(data).map(([id, submission]) => ({
        id,
        ...submission as any,
      }));
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching ${formType} submissions:`, error);
    return [];
  }
}

// Utility function to update approval status
export async function updateApprovalStatus(
  formType: FormType,
  submissionId: string,
  approved: boolean
) {
  try {
    const { update } = await import("firebase/database");
    const submissionRef = ref(rtdb, `forms/${formType}/${submissionId}`);
    
    await update(submissionRef, {
      approved,
      approvedAt: approved ? new Date().toISOString() : null,
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating approval status:", error);
    return { success: false, error };
  }
}