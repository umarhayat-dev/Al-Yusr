import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsletterSubscriberSchema, type NewsletterSubscriberData } from "@/lib/formSchemas";
import { useFormSubmission } from "@/lib/firebaseSubmission";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface NewsletterFormProps {
  className?: string;
  showName?: boolean;
}

export default function NewsletterForm({ className, showName = false }: NewsletterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitForm } = useFormSubmission();

  const form = useForm<NewsletterSubscriberData>({
    resolver: zodResolver(newsletterSubscriberSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  const onSubmit = async (data: NewsletterSubscriberData) => {
    setIsSubmitting(true);
    
    try {
      const result = await submitForm("newsletterSubscribers", data);
      
      if (result.success) {
        form.reset();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-2">
          {showName && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Your name (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="whitespace-nowrap"
          >
            {isSubmitting ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </Form>
    </div>
  );
}