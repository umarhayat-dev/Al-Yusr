import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SimpleLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin?: (userData: {
    name: string;
    email: string;
    role: "student" | "teacher" | "admin";
  }) => void;
}

export default function SimpleLoginModal({
  open,
  onOpenChange,
  onLogin,
}: SimpleLoginModalProps) {
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [showSignupForm, setShowSignupForm] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupForm, setSignupForm] = useState({
    name: "",
    phone: "",
    message: "",
  });

  const handleGoogleLogin = async () => {
    try {
      // Import Firebase auth functions
      const { signInWithGoogle } = await import("@/lib/firebase");
      const user = await signInWithGoogle();

      // Handle redirect case (when popup is blocked)
      if (user === null) {
        return; // Redirect is in progress
      }

      if (user && user.email) {
        // Check if user exists in your real database

        const existingUser = userDatabase.find((u) => u.email === user.email);

        if (existingUser) {
          // User exists in database - proceed with login
          const userData = {
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role as "student" | "teacher" | "admin",
            serial: existingUser.serial || existingUser.id,
            isFinance: existingUser.isFinance || false,
          };
          onLogin?.(userData);
          onOpenChange(false);
        } else {
          // New user - redirect to signup
          setShowSignupForm(true);
          setSignupEmail(user.email);
        }
      }
    } catch (error) {
      console.error("Google login error:", error);
      alert(
        "Google sign-in failed. Please try email/password login or check your internet connection.",
      );
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { email, password } = loginForm;

    // Admin and Teacher accounts (hardcoded)
    const systemUsers = [
      // Admin accounts
      {
        email: "developer.05021988@gmail.com",
        password: "A1234",
        role: "admin",
        name: "Ahmed Merghany",
        isFinance: true,
      },
      {
        email: "alyusrinstitute@gmail.com",
        password: "A123456",
        role: "admin",
        name: "Haleema",
      },

      // Teacher accounts
      {
        email: "ammarah5893@gmail.com",
        password: "A123456",
        role: "teacher",
        name: "Umm Mahir",
        serial: "TE001",
      },
      {
        email: "ahdmirghany@gmail.com",
        password: "A1234",
        role: "teacher",
        name: "Ahmed Merghany",
        serial: "TE002",
      },
      {
        email: "ummemaryam476@gmail.com",
        password: "A1234",
        role: "teacher",
        name: "Reshma",
        serial: "TE011",
      },
      {
        email: "shab2001sharf@gmail.com",
        password: "A1234",
        role: "teacher",
        name: "Shabana",
        serial: "TE013",
      },
      {
        email: "ummenehla79@gmail.com",
        password: "A1234",
        role: "teacher",
        name: "Nehla Sadaf",
        serial: "TE027",
      },
      {
        email: "haleemahfs@gmail.com",
        password: "A1234",
        role: "teacher",
        name: "Haleema Firdose",
        serial: "TE028",
      },
      {
        email: "ahmmohamed898@gmail.com",
        password: "A1234",
        role: "teacher",
        name: "Ahmed Mohamed",
        serial: "TE030",
      },
    ];

    // Check system users first
    const systemUser = systemUsers.find(
      (u) => u.email === email && u.password === password,
    );

    if (systemUser) {
      const userData = {
        name: systemUser.name,
        email: systemUser.email,
        role: systemUser.role as "student" | "teacher" | "admin",
        serial: systemUser.serial,
        isFinance: systemUser.isFinance || false,
      };

      onLogin?.(userData);
      onOpenChange(false);
      window.location.href = `/dashboard/${systemUser.role}`;
      return;
    }

    // Check Firebase users table for student login
    try {
      const { ref, get } = await import("firebase/database");
      const { rtdb } = await import("@/lib/firebase");

      const usersRef = ref(rtdb, "users");
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const users = snapshot.val();
        const studentData = Object.values(users).find(
          (user: any) =>
            user.email === email &&
            user.password === password &&
            user.role === "student",
        );

        if (studentData) {
          const userData = {
            name: (studentData as any).name || "Student",
            email: email,
            role: "student" as const,
            serial: (studentData as any).serial || (studentData as any).id,
            isFinance: false,
          };

          onLogin?.(userData);
          onOpenChange(false);
          window.location.href = "/dashboard/student";
          return;
        }
      }

      alert(
        "Invalid email or password. Please check your credentials or contact admin.",
      );
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again or contact admin.");
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Thank you ${signupForm.name}! Your registration request has been submitted. An admin will review your application and contact you at ${signupEmail} within 24 hours with your account credentials and role assignment.`,
    );
    setShowSignupForm(false);
    onOpenChange(false);
    // Reset forms
    setSignupForm({ name: "", phone: "", message: "" });
    setSignupEmail("");
  };

  if (showSignupForm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              Complete Your Registration
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div className="text-center text-sm text-gray-600 mb-4">
              Welcome! Please provide your details to complete registration for:{" "}
              <strong>{signupEmail}</strong>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={signupForm.name}
                onChange={(e) =>
                  setSignupForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#013626]"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={signupForm.phone}
                onChange={(e) =>
                  setSignupForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#013626]"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Why do you want to join? (Optional)
              </label>
              <textarea
                value={signupForm.message}
                onChange={(e) =>
                  setSignupForm((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#013626] h-20"
                placeholder="Tell us about your learning goals..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSignupForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Back to Login
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[#681616] text-white rounded-md hover:bg-[#5a1313]"
              >
                Submit Registration
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Welcome to AlYusr Institute
          </DialogTitle>
        </DialogHeader>

        <div className="w-full space-y-4">
          <Button
            onClick={handleGoogleLogin}
            className="w-full bg-red-600 hover:bg-red-700 rounded-2xl"
          >
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
                className="rounded-2xl"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                className="rounded-2xl"
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 rounded-2xl"
            >
              Login
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
