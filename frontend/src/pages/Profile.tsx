import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import api, { authAPI } from '../services/api';
import type { User } from '../types';

const Profile: React.FC = () => {
  const { user: contextUser } = useAuth();
  const [user, setUser] = useState<User | null>(contextUser);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch fresh user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setUser(contextUser);
      }
    };
    fetchUserData();
  }, [contextUser]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (oldPassword === newPassword) {
      setError('New password must be different from old password');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      });

      setMessage(response.data.message || 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Auto-clear success message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <h1 style={styles.title}>Profile & Settings</h1>

        {/* User Info Section */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>User Information</h2>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <label style={styles.infoLabel}>Username:</label>
              <span style={styles.infoValue}>{user?.username}</span>
            </div>
            <div style={styles.infoItem}>
              <label style={styles.infoLabel}>Email:</label>
              <span style={styles.infoValue}>{user?.email}</span>
            </div>
            <div style={styles.infoItem}>
              <label style={styles.infoLabel}>Full Name:</label>
              <span style={styles.infoValue}>{user?.full_name || 'N/A'}</span>
            </div>
            <div style={styles.infoItem}>
              <label style={styles.infoLabel}>Role:</label>
              <span style={{...styles.infoValue, ...styles.roleBadge}}>
                {user?.role?.name?.toUpperCase()}
              </span>
            </div>
            <div style={styles.infoItem}>
              <label style={styles.infoLabel}>Account Status:</label>
              <span style={{...styles.infoValue, color: user?.is_active ? '#27ae60' : '#e74c3c'}}>
                {user?.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div style={styles.infoItem}>
              <label style={styles.infoLabel}>Member Since:</label>
              <span style={styles.infoValue}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Change Password</h2>

          {message && (
            <div style={styles.successMessage}>
              ✓ {message}
            </div>
          )}

          {error && (
            <div style={styles.errorMessage}>
              ✗ {error}
            </div>
          )}

          <form onSubmit={handleChangePassword} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                style={styles.input}
                placeholder="Enter your current password"
                disabled={loading}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={styles.input}
                placeholder="Enter new password (min 6 characters)"
                disabled={loading}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
                placeholder="Re-enter new password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              disabled={loading}
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>

          <div style={styles.passwordTips}>
            <h3 style={styles.tipsTitle}>Password Tips:</h3>
            <ul style={styles.tipsList}>
              <li>Use at least 6 characters</li>
              <li>Include uppercase and lowercase letters</li>
              <li>Include numbers and special characters</li>
              <li>Don't reuse old passwords</li>
              <li>Don't share your password with anyone</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f6fa',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '2rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#34495e',
    marginBottom: '1.5rem',
    borderBottom: '2px solid #3498db',
    paddingBottom: '0.5rem',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  infoLabel: {
    fontSize: '0.875rem',
    color: '#7f8c8d',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: '1rem',
    color: '#2c3e50',
    fontWeight: '600',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    backgroundColor: '#3498db',
    color: 'white',
    borderRadius: '4px',
    fontSize: '0.875rem',
    width: 'fit-content',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#34495e',
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '2px solid #dfe6e9',
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#3498db',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '1rem',
  },
  successMessage: {
    padding: '1rem',
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '0.95rem',
  },
  errorMessage: {
    padding: '1rem',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '0.95rem',
  },
  passwordTips: {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    borderLeft: '4px solid #3498db',
  },
  tipsTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#34495e',
    marginBottom: '0.75rem',
  },
  tipsList: {
    margin: 0,
    paddingLeft: '1.5rem',
    color: '#7f8c8d',
    fontSize: '0.9rem',
    lineHeight: '1.8',
  },
};

export default Profile;
