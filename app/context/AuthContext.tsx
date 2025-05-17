'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

type AuthContextType = {
  user: User | null;
  role: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser);

        if (firebaseUser) {
          try {
            const docRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(docRef);
            const userRole = userDoc.exists() ? userDoc.data().role || null : null;
            setRole(userRole);
          } catch (err) {
            console.error('Error al obtener el rol del usuario:', err);
            setRole(null);
          }
        } else {
          setRole(null);
        }

        setLoading(false);

        const isAuthPage =
          typeof window !== 'undefined' &&
          (window.location.pathname === '/auth/signin' || window.location.pathname === '/auth/signup');

        if (!firebaseUser && !isAuthPage) {
          router.push('/auth/signin');
        }
      },
      (error) => {
        console.error('AuthContext error:', error);
        setUser(null);
        setRole(null);
        setLoading(false);
        router.push('/auth/signin');
      }
    );

    return () => unsubscribe();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
