import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api';

// This "context" makes the logged-in user available everywhere in the app
// without passing it as a prop through every component

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // checking if already logged in

  // On app load, check if there's a saved token and fetch user info
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then(res => setUser(res.data.user))
        .catch(() => localStorage.removeItem('token')) // token expired
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this anywhere to get the current user
// Example: const { user, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);
