export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  role_id: number;
  role: Role;
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed";
  assigned_to: number;
  created_by: number;
  due_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface Document {
  id: number;
  title: string;
  filename: string;
  file_type: string;
  file_size?: number;
  file_path?: string;
  content?: string;
  uploaded_by: number;
  created_at: string;
}

export interface SearchResult {
  document_id: number;
  title: string;
  content_snippet: string;
  similarity_score: number;
  filename: string;
}

export interface Analytics {
  task_analytics: {
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    in_progress_tasks: number;
  };
  search_analytics: {
    total_searches: number;
    top_queries: Array<{ query: string; count: number }>;
  };
  total_documents: number;
  total_users: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}
