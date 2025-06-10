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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseRTDB } from "@/lib/firebaseRTDB";
import { Calendar, User, Phone } from "lucide-react";

const bookingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  preferredCourse: z.string().min(1, "Please select a course"),
  preferredDateTime: z.string().min(1, "Preferred date/time is required"),
  experienceLevel: z.enum(["Beginner", "Some knowledge", "Intermediate", "Advanced"]),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: any[];
  selectedCourseId?: number;
}

export default function BookingModal({
  open,
  onOpenChange,
  courses,
  selectedCourseId,
}: BookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { submitBookDemo } = useFirebaseRTDB();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      preferredCourse: selectedCourseId ? courses.find(c => c.id === selectedCourseId)?.title || "" : "",
      preferredDateTime: "",
      experienceLevel: "Beginner",
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      const result = await submitBookDemo(data);
      
      if (result.success) {
        toast({
          title: "Demo Booking Submitted Successfully!",
          description: "We'll contact you to confirm your session.",
          variant: "default",
        });
        form.reset();
        onOpenChange(false);
      } else {
        toast({
          title: "Submission Failed",
          description: result.message || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Calendar className="w-5 h-5 text-[#013626]" />
            Book a Demo
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </FormLabel>
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} />
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
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredCourse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Course</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.title}>
                          {course.title}
                        </SelectItem>
                      ))}
                      <SelectItem value="Quran Recitation">Quran Recitation</SelectItem>
                      <SelectItem value="Islamic Studies">Islamic Studies</SelectItem>
                      <SelectItem value="Arabic Language">Arabic Language</SelectItem>
                      <SelectItem value="Hifz Program">Hifz Program</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredDateTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Date & Time</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field} 
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experienceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience level" />
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

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-reseda-green hover:bg-black-olive text-champagne-pink"
              >
                {isSubmitting ? "Submitting..." : "Book Demo"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}