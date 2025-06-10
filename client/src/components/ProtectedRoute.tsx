import { useEffect } from "react";
import { useLocation } from "wouter";
import { authService } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'teacher' | 'student' | 'finance';
  dashboardType?: string;
}

export default function ProtectedRoute({ children, requiredRole, dashboardType }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const user = authService.getCurrentUser();
    
    // Check if user is authenticated
    if (!user) {
      setLocation('/login');
      return;
    }

    // Check role-based access if required
    if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
      setLocation('/login');
      return;
    }

    // Check dashboard access if specified
    if (dashboardType && !authService.canAccessDashboard(dashboardType)) {
      setLocation('/login');
      return;
    }
  }, [setLocation, requiredRole, dashboardType]);

  // Only render children if user is authenticated and has proper access
  const user = authService.getCurrentUser();
  if (!user) return null;
  
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') return null;
  
  if (dashboardType && !authService.canAccessDashboard(dashboardType)) return null;

  return <>{children}</>;
}