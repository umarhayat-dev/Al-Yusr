import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, User, MessageSquare } from 'lucide-react';

interface SignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SignupModal({ open, onOpenChange }: SignupModalProps) {
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    preferredRole: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create email body for admin
    const emailBody = `
New Registration Request from AlYusr Institute Website:

Name: ${signupForm.name}
Email: ${signupForm.email}
Phone: ${signupForm.phone}
Preferred Role: ${signupForm.preferredRole}
Message: ${signupForm.message}

Please review and create an account for this user in the admin dashboard.
    `;

    // Create mailto link
    const mailtoLink = `mailto:alyusrinstitute@gmail.com?subject=New Registration Request - ${signupForm.name}&body=${encodeURIComponent(emailBody)}`;
    
    // Open email client
    window.open(mailtoLink);
    
    // Show success message
    alert('Thank you for your registration request! An email has been prepared for the admin. Please send it, and you will be contacted once your account is set up.');
    
    // Reset form and close modal
    setSignupForm({ name: '', email: '', phone: '', preferredRole: '', message: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-[#013626]">Join AlYusr Institute</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-[#013626]">
              Full Name *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={signupForm.name}
                onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                className="pl-10 border-gray-300 focus:border-[#013626] focus:ring-[#013626]"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-[#013626]">
              Email Address *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                className="pl-10 border-gray-300 focus:border-[#013626] focus:ring-[#013626]"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-[#013626]">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={signupForm.phone}
              onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
              className="border-gray-300 focus:border-[#013626] focus:ring-[#013626]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-[#013626]">
              I want to join as *
            </Label>
            <Select 
              value={signupForm.preferredRole} 
              onValueChange={(value) => setSignupForm({ ...signupForm, preferredRole: value })}
              required
            >
              <SelectTrigger className="border-gray-300 focus:border-[#013626] focus:ring-[#013626]">
                <SelectValue placeholder="Select your preferred role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student - Learn Quran and Islamic Studies</SelectItem>
                <SelectItem value="teacher">Teacher - Share knowledge and teach</SelectItem>
                <SelectItem value="volunteer">Volunteer - Help with administrative tasks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium text-[#013626]">
              Additional Message
            </Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="message"
                placeholder="Tell us about your background, experience, or any specific interests..."
                value={signupForm.message}
                onChange={(e) => setSignupForm({ ...signupForm, message: e.target.value })}
                className="pl-10 pt-3 min-h-[80px] border-gray-300 focus:border-[#013626] focus:ring-[#013626] resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#681616] hover:bg-[#681616]/90 text-white"
              disabled={!signupForm.name || !signupForm.email || !signupForm.preferredRole}
            >
              Submit Request
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <button 
            onClick={() => onOpenChange(false)}
            className="text-[#681616] hover:underline font-medium"
          >
            Sign in here
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}