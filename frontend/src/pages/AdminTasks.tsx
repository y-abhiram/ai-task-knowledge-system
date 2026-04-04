import React, { useEffect, useState } from 'react';
import { tasksAPI, usersAPI } from '../services/api';
import type { Task, User } from '../types';
import Navbar from '../components/Navbar';

const AdminTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const [editAssignedTo, setEditAssignedTo] = useState<number>(0);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await usersAPI.getUsers();
      // Filter to show only regular users (not admins) - realistic scenario
      const regularUsers = data.filter(user => user.role.name === 'user');
      setUsers(regularUsers);
      // Set default assignee to first user if available
      if (regularUsers.length > 0 && assignedTo === 0) {
        setAssignedTo(regularUsers[0].id);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const data = await tasksAPI.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage('');

    try {
      await tasksAPI.createTask({ title, description, assigned_to: assignedTo });
      setMessage('Task created successfully!');
      setTitle('');
      setDescription('');
      setShowForm(false);
      loadTasks();
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await tasksAPI.deleteTask(id);
      setMessage('Task deleted successfully!');
      loadTasks();
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Failed to delete task');
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditStatus(task.status);
    setEditAssignedTo(task.assigned_to);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    setUpdating(true);
    setMessage('');

    try {
      await tasksAPI.updateTask(editingTask.id, {
        title: editTitle,
        description: editDescription,
        status: editStatus,
        assigned_to: editAssignedTo,
      });
      setMessage('Task updated successfully!');
      setEditingTask(null);
      loadTasks();
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Failed to update task');
    } finally {
      setUpdating(false);
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
        <div style={styles.header}>
          <h1 style={styles.title}>Task Management</h1>
          <button onClick={() => setShowForm(!showForm)} style={styles.createBtn}>
            {showForm ? 'Cancel' : 'Create New Task'}
          </button>
        </div>

        {message && <div style={styles.message}>{message}</div>}

        {showForm && (
          <div style={styles.formSection}>
            <h2 style={styles.sectionTitle}>Create New Task</h2>
            <form onSubmit={handleCreate} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ ...styles.input, minHeight: '100px' }}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Assign To</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(parseInt(e.target.value))}
                  style={styles.select}
                  required
                >
                  <option value={0} disabled>Select a user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.email}) - {user.role.name}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" style={styles.button} disabled={creating}>
                {creating ? 'Creating...' : 'Create Task'}
              </button>
            </form>
          </div>
        )}

        <div style={styles.tasksSection}>
          <h2 style={styles.sectionTitle}>All Tasks</h2>
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
                      <span>
                        Assigned to: {users.find(u => u.id === task.assigned_to)?.username || `User #${task.assigned_to}`}
                      </span>
                      <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={styles.actions}>
                    <button onClick={() => handleEditClick(task)} style={styles.editBtn}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(task.id)} style={styles.deleteBtn}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Task Modal */}
        {editingTask && (
          <div style={styles.modal} onClick={() => setEditingTask(null)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2>Edit Task</h2>
                <button onClick={() => setEditingTask(null)} style={styles.closeBtn}>
                  ✕
                </button>
              </div>
              <form onSubmit={handleUpdate} style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    style={{ ...styles.input, minHeight: '100px' }}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'pending' | 'in_progress' | 'completed')}
                    style={styles.select}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Assign To</label>
                  <select
                    value={editAssignedTo}
                    onChange={(e) => setEditAssignedTo(parseInt(e.target.value))}
                    style={styles.select}
                    required
                  >
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.modalActions}>
                  <button type="button" onClick={() => setEditingTask(null)} style={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.button} disabled={updating}>
                    {updating ? 'Updating...' : 'Update Task'}
                  </button>
                </div>
              </form>
            </div>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    color: '#2c3e50',
  },
  createBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  message: {
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '4px',
  },
  formSection: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
  },
  sectionTitle: {
    color: '#2c3e50',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#2c3e50',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  select: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  tasksSection: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
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
    display: 'flex',
    gap: '0.5rem',
  },
  editBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #ddd',
  },
  modalBody: {
    padding: '1.5rem',
    overflow: 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  modalActions: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-end',
    marginTop: '1rem',
  },
  cancelBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#7f8c8d',
    padding: '0',
    width: '2rem',
    height: '2rem',
  },
};

export default AdminTasks;
