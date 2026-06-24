import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar   from './components/Navbar';
import Feed     from './pages/Feed';
import Inbox    from './pages/Inbox';
import Profile  from './pages/Profile';
import Login    from './pages/Login';
import Register from './pages/Register';
import SendTell from './pages/SendTell';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return user ? <Navigate to="/" /> : children;
}

function AppLayout() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <main className="main-container">
        <Routes>
          <Route path="/login"          element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register"       element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/tell/:username" element={<SendTell />} />
          <Route path="/"               element={<PrivateRoute><Feed /></PrivateRoute>} />
          <Route path="/inbox"          element={<PrivateRoute><Inbox /></PrivateRoute>} />
          <Route path="/profile"        element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="*"               element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}