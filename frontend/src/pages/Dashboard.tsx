import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { analyticsAPI } from '../services/api';
import type { Analytics } from '../types';
import Navbar from '../components/Navbar';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      console.log('Loading analytics...');
      const data = await analyticsAPI.getAnalytics();
      console.log('Analytics data received:', data);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.loading}>Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.welcome}>Welcome, {user?.username}!</p>

        {analytics && (
          <div style={styles.analytics}>
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Task Analytics</h2>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>{analytics.task_analytics.total_tasks}</div>
                  <div style={styles.statLabel}>Total Tasks</div>
                </div>
                <div style={{ ...styles.statCard, ...styles.statCardSuccess }}>
                  <div style={styles.statValue}>{analytics.task_analytics.completed_tasks}</div>
                  <div style={styles.statLabel}>Completed</div>
                </div>
                <div style={{ ...styles.statCard, ...styles.statCardWarning }}>
                  <div style={styles.statValue}>{analytics.task_analytics.in_progress_tasks}</div>
                  <div style={styles.statLabel}>In Progress</div>
                </div>
                <div style={{ ...styles.statCard, ...styles.statCardDanger }}>
                  <div style={styles.statValue}>{analytics.task_analytics.pending_tasks}</div>
                  <div style={styles.statLabel}>Pending</div>
                </div>
              </div>
            </div>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>System Statistics</h2>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>{analytics.total_documents}</div>
                  <div style={styles.statLabel}>Total Documents</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>{analytics.search_analytics.total_searches}</div>
                  <div style={styles.statLabel}>Total Searches</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>{analytics.total_users}</div>
                  <div style={styles.statLabel}>Total Users</div>
                </div>
              </div>
            </div>

            {analytics.search_analytics.top_queries.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Top Search Queries</h2>
                <div style={styles.queryList}>
                  {analytics.search_analytics.top_queries.map((item, index) => (
                    <div key={index} style={styles.queryItem}>
                      <span style={styles.queryText}>{item.query}</span>
                      <span style={styles.queryCount}>{item.count} searches</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  title: {
    color: '#2c3e50',
    marginBottom: '0.5rem',
  },
  welcome: {
    color: '#7f8c8d',
    fontSize: '1.1rem',
    marginBottom: '2rem',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.2rem',
    color: '#7f8c8d',
  },
  analytics: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  section: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    color: '#2c3e50',
    marginBottom: '1rem',
    fontSize: '1.3rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  statCard: {
    padding: '1.5rem',
    backgroundColor: '#ecf0f1',
    borderRadius: '8px',
    textAlign: 'center',
  },
  statCardSuccess: {
    backgroundColor: '#d5f4e6',
  },
  statCardWarning: {
    backgroundColor: '#fff3cd',
  },
  statCardDanger: {
    backgroundColor: '#f8d7da',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '0.5rem',
  },
  statLabel: {
    color: '#7f8c8d',
    fontSize: '0.9rem',
  },
  queryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  queryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  queryText: {
    color: '#2c3e50',
    fontWeight: '500',
  },
  queryCount: {
    color: '#7f8c8d',
    fontSize: '0.9rem',
  },
};

export default Dashboard;
