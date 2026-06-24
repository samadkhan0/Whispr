import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getInbox } from '../api';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user }          = useAuth();
  const { theme, toggle } = useTheme();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetch = () =>
      getInbox()
        .then(res => setUnread(res.data.tells.filter(t => !t.isRead).length))
        .catch(() => {});
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <nav className="navbar">
      <div className="nav-brand">👻 whispr</div>
      <div className="nav-links">
        <NavLink to="/"        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Feed</NavLink>
        <NavLink to="/inbox"   className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Inbox {unread > 0 && <span className="badge">{unread}</span>}
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Profile</NavLink>
        <button className="theme-btn" onClick={toggle} title="Toggle dark mode">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
}