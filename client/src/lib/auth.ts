import { rtdb } from "./firebase";
import { ref, get } from "firebase/database";

export interface RTDBUser {
  id: string;
  email: string;
  pass: string;
  name: string;
  role: string;
  isAdmin: boolean;
  serial: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student' | 'finance';
  initials: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private authCallbacks: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    // Check for existing session on initialization
    this.checkExistingSession();
  }

  private checkExistingSession() {
    const sessionData = localStorage.getItem('alyusr_auth_session');
    if (sessionData) {
      try {
        const user = JSON.parse(sessionData);
        this.currentUser = user;
        this.notifyCallbacks(user);
      } catch (error) {
        console.error('Invalid session data:', error);
        localStorage.removeItem('alyusr_auth_session');
      }
    }
  }

  private notifyCallbacks(user: AuthUser | null) {
    this.authCallbacks.forEach(callback => callback(user));
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    this.authCallbacks.push(callback);
    // Immediately call with current state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      this.authCallbacks = this.authCallbacks.filter(cb => cb !== callback);
    };
  }

  async signInWithEmailAndPassword(email: string, password: string): Promise<AuthUser> {
    try {
      console.log('🔐 Attempting RTDB authentication for:', email);
      
      // Get users from RTDB
      const usersRef = ref(rtdb, 'users');
      const snapshot = await get(usersRef);
      const users = snapshot.val() || {};
      
      console.log('👥 Found users in RTDB:', Object.keys(users).length);
      
      // Find user by email
      const userEntry = Object.entries(users).find(([_, userData]: [string, any]) => 
        userData.email === email && userData.active !== false
      );
      
      if (!userEntry) {
        throw new Error('User not found or inactive');
      }
      
      const [userId, userData] = userEntry as [string, RTDBUser];
      
      // Check against 'pass' field in your Firebase structure
      if (userData.pass !== password) {
        throw new Error('Invalid password');
      }
      
      // Map role from your database structure - isAdmin takes priority
      let mappedRole: 'admin' | 'teacher' | 'student' | 'finance';
      if (userData.isAdmin === true) {
        mappedRole = 'admin';
      } else if (userData.role && userData.role.toLowerCase() === 'finance') {
        mappedRole = 'finance';
      } else if (userData.role && userData.role.toLowerCase() === 'teacher') {
        mappedRole = 'teacher';
      } else if (userData.role && userData.role.toLowerCase() === 'student') {
        mappedRole = 'student';
      } else {
        mappedRole = 'student'; // default fallback
      }
      
      const authUser: AuthUser = {
        id: userId,
        email: userData.email,
        name: userData.name,
        role: mappedRole,
        initials: userData.name.charAt(0).toUpperCase()
      };
      
      // Store session
      localStorage.setItem('alyusr_auth_session', JSON.stringify(authUser));
      this.currentUser = authUser;
      this.notifyCallbacks(authUser);
      
      console.log('✅ Authentication successful for:', userData.name, 'Role:', userData.role);
      return authUser;
      
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw error;
    }
  }

  async signOut() {
    localStorage.removeItem('alyusr_auth_session');
    this.currentUser = null;
    this.notifyCallbacks(null);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  hasRole(role: 'admin' | 'teacher' | 'student' | 'finance'): boolean {
    return this.currentUser?.role === role;
  }

  canAccessDashboard(dashboardType: string): boolean {
    if (!this.isAuthenticated()) return false;
    
    const roleMap: Record<string, string[]> = {
      'admin': ['admin'],
      'teacher': ['teacher', 'admin'],
      'student': ['student', 'admin'],
      'finance': ['finance', 'admin']
    };
    
    const allowedRoles = roleMap[dashboardType] || [];
    return allowedRoles.includes(this.currentUser!.role);
  }
}

export const authService = new AuthService();