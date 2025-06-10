import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChange, getUserProfile } from '@/lib/firebase';

interface User {
  uid: string;
  email: string;
  displayName?: string;
  role?: 'student' | 'teacher' | 'admin';
  profileData?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isStudent: false,
  isTeacher: false,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profileData = await getUserProfile(firebaseUser.uid);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            role: profileData?.role || 'student',
            profileData
          });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            role: 'student'
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    isStudent: user?.role === 'student',
    isTeacher: user?.role === 'teacher',
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};