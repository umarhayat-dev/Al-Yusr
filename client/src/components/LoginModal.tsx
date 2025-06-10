import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, createUserProfile } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '', 
    name: '', 
    role: 'student' 
  });
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      
      // Create user profile if it doesn't exist
      await createUserProfile(user.uid, {
        name: user.displayName || '',
        email: user.email || '',
        role: 'student',
        createdAt: new Date(),
        loginMethod: 'google'
      });

      toast({
        title: "Welcome!",
        description: "Successfully logged in with Google.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Failed to login with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmail(loginForm.email, loginForm.password);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupForm.password !== signupForm.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const user = await signUpWithEmail(signupForm.email, signupForm.password);
      
      // Create user profile
      await createUserProfile(user.uid, {
        name: signupForm.name,
        email: signupForm.email,
        role: signupForm.role,
        createdAt: new Date(),
        loginMethod: 'email'
      });

      toast({
        title: "Account created!",
        description: "Welcome to AlYusr Institute.",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Welcome to AlYusr Institute</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <Button 
              onClick={handleGoogleLogin} 
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 rounded-2xl"
            >
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="rounded-2xl"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="rounded-2xl"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-2xl">
                Login
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <Button 
              onClick={handleGoogleLogin} 
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 rounded-2xl"
            >
              Sign up with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or sign up with email</span>
              </div>
            </div>

            <form onSubmit={handleEmailSignup} className="space-y-3">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                  className="rounded-2xl"
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                  className="rounded-2xl"
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">I am a</Label>
                <Select value={signupForm.role} onValueChange={(value) => setSignupForm({...signupForm, role: value})}>
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                  className="rounded-2xl"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={signupForm.confirmPassword}
                  onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})}
                  className="rounded-2xl"
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-2xl">
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}