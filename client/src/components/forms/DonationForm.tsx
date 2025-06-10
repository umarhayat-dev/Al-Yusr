import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, DollarSign, Shield } from 'lucide-react';
import { useFirebaseRTDB } from '@/lib/firebaseRTDB';

const donationSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  amount: z.number().min(1, "Donation amount must be greater than 0"),
  message: z.string().optional(),
  isAnonymous: z.boolean().optional(),
});

type DonationFormData = z.infer<typeof donationSchema>;

interface DonationFormProps {
  onClose?: () => void;
}

export default function DonationForm({ onClose }: DonationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitDonation } = useFirebaseRTDB();

  const form = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      amount: 0,
      message: '',
      isAnonymous: false,
    },
  });

  const onSubmit = async (data: DonationFormData) => {
    setIsSubmitting(true);
    try {
      const result = await submitDonation(data);
      if (result.success) {
        form.reset();
        onClose?.();
      }
    } catch (error) {
      console.error('Error submitting donation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const predefinedAmounts = [25, 50, 100, 250, 500, 1000];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Heart className="h-6 w-6 text-emerald-600" />
          Support Islamic Education
        </CardTitle>
        <CardDescription>
          Your donation helps us provide quality Islamic education to students worldwide
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
          <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
            Your Impact
          </h3>
          <ul className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
            <li>• $25 sponsors one student for a month</li>
            <li>• $50 provides learning materials for 5 students</li>
            <li>• $100 supports a teacher's training program</li>
            <li>• $250 funds a scholarship for disadvantaged students</li>
          </ul>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Donation Amount */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Donation Amount
              </h3>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                {predefinedAmounts.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    onClick={() => form.setValue('amount', amount)}
                    className={`${
                      form.watch('amount') === amount 
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-700' 
                        : ''
                    }`}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Amount (USD) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter amount" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Share why you're supporting Islamic education..."
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
                name="isAnonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Make this donation anonymous
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Your name will not be displayed publicly
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    Secure & Trusted
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    This is a donation request form. Payment processing will be handled separately 
                    for security. You will be contacted with payment instructions.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              {onClose && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Donation Request'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}