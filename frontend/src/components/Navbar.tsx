import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/dashboard" style={styles.brand}>
          Task & Knowledge System
        </Link>
        <div style={styles.navLinks}>
          <Link to="/dashboard" style={isActive('/dashboard') ? {...styles.link, ...styles.activeLink} : styles.link}>
            Dashboard
          </Link>
          {isAdmin && (
            <>
              <Link to="/admin/documents" style={isActive('/admin/documents') ? {...styles.link, ...styles.activeLink} : styles.link}>
                Documents
              </Link>
              <Link to="/admin/tasks" style={isActive('/admin/tasks') ? {...styles.link, ...styles.activeLink} : styles.link}>
                Manage Tasks
              </Link>
              <Link to="/search" style={isActive('/search') ? {...styles.link, ...styles.activeLink} : styles.link}>
                Search
              </Link>
            </>
          )}
          {!isAdmin && (
            <>
              <Link to="/search" style={isActive('/search') ? {...styles.link, ...styles.activeLink} : styles.link}>
                Search
              </Link>
              <Link to="/tasks" style={isActive('/tasks') ? {...styles.link, ...styles.activeLink} : styles.link}>
                My Tasks
              </Link>
            </>
          )}
          <Link to="/profile" style={isActive('/profile') ? {...styles.link, ...styles.activeLink} : styles.link}>
            Profile
          </Link>
          <div style={styles.userInfo}>
            <span style={styles.username}>
              {user?.username} ({user?.role?.name})
            </span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  navbar: {
    backgroundColor: '#2c3e50',
    padding: '1rem 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    color: '#ecf0f1',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textDecoration: 'none',
  },
  navLinks: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  link: {
    color: '#ecf0f1',
    textDecoration: 'none',
    fontSize: '1rem',
    transition: 'all 0.2s',
    paddingBottom: '0.5rem',
  },
  activeLink: {
    color: '#3498db',
    borderBottom: '2px solid #3498db',
    fontWeight: '500',
  },
  userInfo: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  username: {
    color: '#ecf0f1',
    fontSize: '0.9rem',
  },
  logoutBtn: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
};

export default Navbar;
