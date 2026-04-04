import React, { useEffect, useState } from 'react';
import { tasksAPI } from '../services/api';
import type { Task } from '../types';
import Navbar from '../components/Navbar';

const UserTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadTasks();
  }, [filter]);

  const loadTasks = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const data = await tasksAPI.getTasks(params);
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: Task['status']) => {
    try {
      await tasksAPI.updateTask(id, { status: newStatus });
      loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#27ae60';
      case 'in_progress':
        return '#f39c12';
      default:
        return '#e74c3c';
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>My Tasks</h1>

        <div style={styles.filterSection}>
          <button
            onClick={() => setFilter('all')}
            style={{
              ...styles.filterBtn,
              ...(filter === 'all' ? styles.filterBtnActive : {}),
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            style={{
              ...styles.filterBtn,
              ...(filter === 'pending' ? styles.filterBtnActive : {}),
            }}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            style={{
              ...styles.filterBtn,
              ...(filter === 'in_progress' ? styles.filterBtnActive : {}),
            }}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('completed')}
            style={{
              ...styles.filterBtn,
              ...(filter === 'completed' ? styles.filterBtnActive : {}),
            }}
          >
            Completed
          </button>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : tasks.length === 0 ? (
          <div style={styles.empty}>No tasks found</div>
        ) : (
          <div style={styles.taskList}>
            {tasks.map((task) => (
              <div key={task.id} style={styles.taskCard}>
                <div style={styles.taskInfo}>
                  <h3 style={styles.taskTitle}>{task.title}</h3>
                  <p style={styles.taskDescription}>{task.description}</p>
                  <div style={styles.taskMeta}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(task.status),
                      }}
                    >
                      {task.status}
                    </span>
                    <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={styles.actions}>
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusUpdate(task.id, e.target.value as Task['status'])
                    }
                    style={styles.select}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            ))}
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
    marginBottom: '1.5rem',
  },
  filterSection: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
  },
  filterBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#ecf0f1',
    color: '#2c3e50',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  filterBtnActive: {
    backgroundColor: '#3498db',
    color: 'white',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#7f8c8d',
  },
  empty: {
    textAlign: 'center',
    padding: '2rem',
    color: '#7f8c8d',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  taskCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    color: '#2c3e50',
    marginBottom: '0.5rem',
  },
  taskDescription: {
    color: '#7f8c8d',
    marginBottom: '0.75rem',
  },
  taskMeta: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    fontSize: '0.85rem',
    color: '#7f8c8d',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    color: 'white',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  actions: {
    marginLeft: '1rem',
  },
  select: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
};

export default UserTasks;
