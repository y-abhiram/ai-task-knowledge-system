import axios from 'axios';
import type { LoginRequest, LoginResponse, Task, Document, SearchResult, Analytics, User } from '../types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },
  register: async (userData: any): Promise<User> => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },
  getCurrentUser: async (): Promise<User> => {
    // Get user ID from token
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No token found');
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const userId = decodedToken.sub;

    const { data } = await api.get(`/users/${userId}`);
    return data;
  },
};

export const tasksAPI = {
  getTasks: async (params?: { status?: string; assigned_to?: number }): Promise<Task[]> => {
    const { data } = await api.get('/tasks', { params });
    return data;
  },
  getTask: async (id: number): Promise<Task> => {
    const { data } = await api.get(`/tasks/${id}`);
    return data;
  },
  createTask: async (taskData: Partial<Task>): Promise<Task> => {
    const { data } = await api.post('/tasks', taskData);
    return data;
  },
  updateTask: async (id: number, taskData: Partial<Task>): Promise<Task> => {
    const { data } = await api.patch(`/tasks/${id}`, taskData);
    return data;
  },
  deleteTask: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

export const documentsAPI = {
  getDocuments: async (): Promise<Document[]> => {
    const { data } = await api.get('/documents');
    return data;
  },
  getDocument: async (id: number): Promise<Document> => {
    const { data } = await api.get(`/documents/${id}`);
    return data;
  },
  uploadDocument: async (file: File, title: string): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    const { data } = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
  deleteDocument: async (id: number): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },
};

export const searchAPI = {
  search: async (query: string, top_k: number = 5): Promise<SearchResult[]> => {
    const { data } = await api.post('/search', { query, top_k });
    return data;
  },
};

export const analyticsAPI = {
  getAnalytics: async (): Promise<Analytics> => {
    const { data } = await api.get('/analytics');
    return data;
  },
};

export const usersAPI = {
  getUsers: async (): Promise<User[]> => {
    const { data } = await api.get('/users');
    return data;
  },
  getUser: async (id: number): Promise<User> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },
};

export default api;
