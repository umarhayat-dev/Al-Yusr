import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseRTDB } from "@/lib/firebaseRTDB";
import { MessageCircle, Calendar, User, Clock } from "lucide-react";

const consultationSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  currentSituation: z.enum(["Student", "Working Professional", "Stay-at-home Parent", "Retired", "Unemployed", "Other"]),
  challenges: z.string().min(10, "Please describe your challenges (minimum 10 characters)"),
  goals: z.string().min(10, "Please describe your goals (minimum 10 characters)"),
  learningPreference: z.enum(["One-on-one", "Small groups", "Self-paced", "Structured classes"]),
  knowledgeLevel: z.enum(["Beginner", "Some knowledge", "Intermediate", "Advanced"]),
  preferredDateTime: z.string().min(1, "Preferred consultation time is required"),
  specificQuestions: z.string().optional(),
  howDidYouHear: z.enum(["Social Media", "Friend/Family", "Google Search", "Islamic Center", "Other"]),
});

type ConsultationFormData = z.infer<typeof consultationSchema>;

interface ConsultationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ConsultationModal({ open, onOpenChange }: ConsultationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitConsultation } = useFirebaseRTDB();
  const { toast } = useToast();

  const form = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      currentSituation: undefined,
      challenges: '',
      goals: '',
      learningPreference: undefined,
      knowledgeLevel: undefined,
      preferredDateTime: '',
      specificQuestions: '',
      howDidYouHear: undefined,
    },
  });

  const onSubmit = async (data: ConsultationFormData) => {
    setIsSubmitting(true);
    try {
      const result = await submitConsultation(data);
      if (result.success) {
        form.reset();
        onOpenChange(false);
        toast({
          title: "Consultation Booked!",
          description: "We'll contact you soon to schedule your free consultation.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error submitting consultation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
            <MessageCircle className="h-6 w-6 text-emerald-600" />
            Free Islamic Education Consultation
          </DialogTitle>
          <p className="text-gray-600 mt-2">
            Get personalized guidance on your Islamic learning journey from our experienced counselors
          </p>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentSituation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current situation *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your situation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Student">Student</SelectItem>
                          <SelectItem value="Working Professional">Working Professional</SelectItem>
                          <SelectItem value="Stay-at-home Parent">Stay-at-home Parent</SelectItem>
                          <SelectItem value="Retired">Retired</SelectItem>
                          <SelectItem value="Unemployed">Unemployed</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Learning Assessment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Learning Assessment</h3>
              
              <FormField
                control={form.control}
                name="challenges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What challenges are you facing in your Islamic learning? *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe any difficulties or obstacles you're experiencing..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What are your Islamic learning goals? *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Share what you hope to achieve through Islamic education..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="learningPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred learning style *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your preference" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="One-on-one">One-on-one</SelectItem>
                          <SelectItem value="Small groups">Small groups</SelectItem>
                          <SelectItem value="Self-paced">Self-paced</SelectItem>
                          <SelectItem value="Structured classes">Structured classes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="knowledgeLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current knowledge level *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Some knowledge">Some knowledge</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Consultation Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Consultation Details
              </h3>

              <FormField
                control={form.control}
                name="preferredDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred consultation time *</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specificQuestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Any specific questions for the counselor?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Share any specific questions or topics you'd like to discuss..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="howDidYouHear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How did you hear about us? *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Social Media">Social Media</SelectItem>
                        <SelectItem value="Friend/Family">Friend/Family</SelectItem>
                        <SelectItem value="Google Search">Google Search</SelectItem>
                        <SelectItem value="Islamic Center">Islamic Center</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-reseda-green hover:bg-black-olive text-champagne-pink"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Book Free Consultation'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}