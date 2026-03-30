import { createContext, useContext, useState, useEffect } from 'react';
import { db, ref, get, set } from '../services/firebase';

const AuthContext = createContext();

const DEMO_USERS = [
  { id: 'u1', email: 'student@aqbobek.kz', password: 'demo123', role: 'student', name: 'Арман Абдуллаев', nameEn: 'Arman Abdullayev', studentId: 's1', classId: 'c10a' },
  { id: 'u2', email: 'teacher@aqbobek.kz', password: 'demo123', role: 'teacher', name: 'Айгуль Нурланова', nameEn: 'Aigul Nurlanova', teacherId: 't1', classId: 'c10a' },
  { id: 'u3', email: 'parent@aqbobek.kz', password: 'demo123', role: 'parent', name: 'Нұрлан Абдуллаев', nameEn: 'Nurlan Abdullayev', linkedStudentId: 's1' },
  { id: 'u4', email: 'admin@aqbobek.kz', password: 'demo123', role: 'admin', name: 'Директор', nameEn: 'Director' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('aqbobek_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('aqbobek_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (demoUser) {
      setUser(demoUser);
      localStorage.setItem('aqbobek_user', JSON.stringify(demoUser));
      return demoUser;
    }

    try {
      const snapshot = await get(ref(db, 'users'));
      if (snapshot.exists()) {
        const users = snapshot.val();
        const found = Object.values(users).find(u => u.email === email && u.password === password);
        if (found) {
          setUser(found);
          localStorage.setItem('aqbobek_user', JSON.stringify(found));
          return found;
        }
      }
    } catch (error) {
      console.error('Firebase login error:', error);
    }

    throw new Error('Invalid credentials');
  };

  const loginAsRole = (role) => {
    const demoUser = DEMO_USERS.find(u => u.role === role);
    if (demoUser) {
      setUser(demoUser);
      localStorage.setItem('aqbobek_user', JSON.stringify(demoUser));
      return demoUser;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aqbobek_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginAsRole, logout, DEMO_USERS }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export { DEMO_USERS };
