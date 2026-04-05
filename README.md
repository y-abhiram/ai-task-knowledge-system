# AI-Powered Task & Knowledge Management System

A full-stack web application that combines task management with AI-powered semantic document search. Built with FastAPI (Python), React (TypeScript), MySQL, and FAISS vector search.

## 🎥 Demo Video

Watch the application in action: [Demo Video](https://drive.google.com/file/d/1HzTYoMc8q7WOn9_06Ttr7-15Oh8hu1Y4/view?usp=sharing)

## 🎯 Project Overview

This system demonstrates modern software architecture with:
- **Backend**: FastAPI with clean architecture (controllers → services → repositories)
- **Frontend**: React 18 with TypeScript and Context API
- **AI/ML**: Semantic search using sentence-transformers and FAISS
- **Security**: JWT authentication with Role-Based Access Control (RBAC)
- **Database**: MySQL with proper relational design and foreign keys

## 🏗️ Architecture & Design Decisions

### Backend Architecture

**Technology Stack:**
- **FastAPI**: Chosen for its async support, automatic OpenAPI docs, and modern Python features
- **SQLAlchemy ORM**: Type-safe database operations with proper relationship management
- **JWT + Passlib**: Industry-standard authentication with bcrypt password hashing
- **Sentence-Transformers**: `all-MiniLM-L6-v2` model for efficient local embeddings (384 dimensions)
- **FAISS**: Facebook's vector similarity search library for fast semantic retrieval
- **PyMySQL**: Pure-Python MySQL driver for compatibility

**Architectural Patterns:**
```
Client Request
    ↓
API Layer (FastAPI Routes)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Database (MySQL)
```

**Why This Architecture?**
- **Separation of Concerns**: Each layer has a single responsibility
- **Testability**: Easy to unit test services and repositories independently
- **Scalability**: Can swap database implementations without touching business logic
- **Maintainability**: Clear code organization makes onboarding new developers easier

### Frontend Architecture

**Technology Stack:**
- **React 18**: Latest features including concurrent rendering
- **TypeScript**: Type safety prevents runtime errors and improves developer experience
- **Vite**: Lightning-fast HMR (Hot Module Replacement) and optimized builds
- **Axios**: HTTP client with interceptors for automatic JWT token injection
- **React Router v6**: Declarative routing with protected routes
- **Context API**: Built-in state management (no Redux needed for this scale)

**Why These Choices?**
- **TypeScript over JavaScript**: Catches 70% of bugs at compile time
- **Vite over Create React App**: 10-100x faster development server startup
- **Context API over Redux**: Simpler for this application size, less boilerplate
- **Inline styles**: Quick development, no CSS build step needed for MVP

### Database Design

**Schema (Normalized to 3NF):**

```sql
roles
├── id (PK)
├── name (UNIQUE)
└── description

users
├── id (PK)
├── username (UNIQUE)
├── email (UNIQUE)
├── hashed_password
├── role_id (FK → roles.id)
└── timestamps

tasks
├── id (PK)
├── title
├── description
├── status (ENUM)
├── assigned_to (FK → users.id)
├── created_by (FK → users.id)
└── timestamps

documents
├── id (PK)
├── title
├── filename
├── file_path
├── content (TEXT)
├── uploaded_by (FK → users.id)
└── timestamps

activity_logs
├── id (PK)
├── user_id (FK → users.id)
├── action_type
├── description
├── metadata (JSON)
└── created_at

search_queries
├── id (PK)
├── user_id (FK → users.id)
├── query_text
├── results_count
└── created_at
```

## 🚀 Features Implemented

### ✅ Mandatory Requirements

1. **Authentication & RBAC**
   - JWT token-based authentication
   - Two roles: Admin and User
   - Protected API endpoints based on roles
   - Password hashing with bcrypt

2. **MySQL Database**
   - Proper relational schema with Primary Keys and Foreign Keys
   - All required tables: users, roles, tasks, documents, activity_logs
   - Additional table: search_queries for analytics

3. **Document Upload**
   - Supports .txt and .pdf files
   - Extracts and stores text content
   - Metadata tracking (filename, size, upload date)
   - Automatic embedding generation for AI search

4. **AI-Powered Semantic Search**
   - **Local embeddings**: Uses sentence-transformers (no external API dependency)
   - **Vector storage**: FAISS IndexFlatIP for inner product similarity
   - **Query processing**: Text → embedding → vector search → ranked results
   - **Persistence**: FAISS index and document mapping saved to disk

5. **Task Management**
   - **Admin**: Create, assign, and delete tasks
   - **User**: View assigned tasks, update status (pending → in_progress → completed)
   - Task filtering by status and assigned user

6. **Dynamic Filtering API**
   - `/tasks?status=completed` - Filter by task status
   - `/tasks?assigned_to=1` - Filter by user ID
   - Supports combining multiple filters

7. **Activity Logging**
   - Tracks: login, task updates, document uploads, searches
   - Stores metadata (JSON) for detailed audit trails
   - IP address tracking

8. **Analytics Dashboard**
   - Task statistics (total, completed, pending, in_progress)
   - Search analytics (total searches, top queries)
   - System metrics (total documents, users)

## 📋 Required APIs

All APIs are fully implemented:

- ✅ `POST /auth/login` - User authentication
- ✅ `POST /auth/register` - User registration
- ✅ `GET /tasks` - List tasks (with filters)
- ✅ `POST /tasks` - Create task (admin only)
- ✅ `PATCH /tasks/{id}` - Update task
- ✅ `GET /documents` - List documents
- ✅ `POST /documents` - Upload document (admin only)
- ✅ `POST /search` - Semantic search
- ✅ `GET /analytics` - System analytics

## 🛠️ Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8.0+
- Git

### Backend Setup

1. **Clone and Navigate**
```bash
cd /home/jony/Documents/FutureTransformation/backend
```

2. **Create Virtual Environment**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure Database**
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE task_knowledge_db;
EXIT;
```

5. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

Example `.env`:
```
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost:3306/task_knowledge_db
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIR=uploads
VECTOR_STORE_DIR=vector_store
```

6. **Initialize Database**
```bash
python init_db.py
```

This creates all tables and default users:
- **Admin**: username=`admin`, password=`admin123`
- **User**: username=`user`, password=`user123`

7. **Run Backend Server**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run at: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to Frontend**
```bash
cd /home/jony/Documents/FutureTransformation/frontend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Run Development Server**
```bash
npm run dev
```

Frontend will run at: `http://localhost:5173`

## 🧪 Testing the Application

### 1. Login
- Visit `http://localhost:5173`
- Login as Admin: `admin` / `admin123`
- Or User: `user` / `user123`

### 2. Admin Workflow
1. Upload documents (Documents page)
2. Create tasks and assign to users (Manage Tasks page)
3. View analytics (Dashboard)

### 3. User Workflow
1. View assigned tasks (My Tasks page)
2. Update task status
3. Search documents using AI (Search page)
4. View analytics (Dashboard)

### 4. Test AI Search
1. Upload a document with content
2. Go to Search page
3. Enter natural language query
4. View ranked results with similarity scores

## 🔍 API Testing with cURL

### Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Upload Document (Admin)
```bash
curl -X POST http://localhost:8000/documents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Sample Document" \
  -F "file=@/path/to/document.txt"
```

### Search Documents
```bash
curl -X POST http://localhost:8000/search \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "what is machine learning", "top_k": 5}'
```

### Filter Tasks
```bash
curl -X GET "http://localhost:8000/tasks?status=completed" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Technical Highlights

### AI Implementation Details

**Embedding Model**: `all-MiniLM-L6-v2`
- **Why**: 384-dimensional embeddings, fast inference, good semantic understanding
- **Performance**: ~5ms per query on CPU
- **Size**: 22MB model (lightweight, no GPU needed)

**Vector Search**: FAISS IndexFlatIP
- **Algorithm**: Inner product similarity (cosine similarity after normalization)
- **Complexity**: O(n) for n documents (acceptable for MVP, can optimize with IVF)
- **Persistence**: Index saved to disk, loads on startup

**Search Pipeline**:
```
User Query
    ↓
Tokenization (sentence-transformers)
    ↓
384-dim Embedding Vector
    ↓
L2 Normalization
    ↓
FAISS Inner Product Search
    ↓
Top-K Results with Scores
    ↓
Document Metadata Retrieval
    ↓
Ranked Results to User
```

### Security Implementation

1. **Password Security**
   - Bcrypt hashing with work factor 12
   - Salted per-password
   - Never stored in plain text

2. **JWT Tokens**
   - HS256 algorithm
   - 30-minute expiration
   - Payload: user_id, username, role

3. **RBAC Middleware**
   - Decorator-based authorization
   - Route-level protection
   - Admin-only endpoints enforced

4. **Input Validation**
   - Pydantic schemas validate all inputs
   - SQL injection prevented by ORM
   - File type validation on uploads

## 📁 Project Structure

```
FutureTransformation/
├── backend/
│   ├── app/
│   │   ├── api/                 # API routes/controllers
│   │   │   ├── auth.py
│   │   │   ├── tasks.py
│   │   │   ├── documents.py
│   │   │   ├── search.py
│   │   │   └── analytics.py
│   │   ├── core/                # Core utilities
│   │   │   ├── config.py        # Settings
│   │   │   ├── database.py      # DB connection
│   │   │   └── security.py      # JWT & hashing
│   │   ├── middleware/          # Auth middleware
│   │   │   └── auth.py
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── task.py
│   │   │   ├── document.py
│   │   │   ├── activity_log.py
│   │   │   └── search_query.py
│   │   ├── repositories/        # Data access layer
│   │   │   ├── user_repository.py
│   │   │   ├── task_repository.py
│   │   │   └── ...
│   │   ├── schemas/             # Pydantic schemas
│   │   │   ├── user.py
│   │   │   ├── task.py
│   │   │   └── ...
│   │   ├── services/            # Business logic
│   │   │   ├── embedding_service.py
│   │   │   └── activity_log_service.py
│   │   └── main.py              # FastAPI app
│   ├── uploads/                 # Uploaded files
│   ├── vector_store/            # FAISS index
│   ├── init_db.py               # Database initialization
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Navbar.tsx
│   │   │   └── PrivateRoute.tsx
│   │   ├── contexts/            # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── pages/               # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AdminDocuments.tsx
│   │   │   ├── AdminTasks.tsx
│   │   │   ├── UserTasks.tsx
│   │   │   └── Search.tsx
│   │   ├── services/            # API client
│   │   │   └── api.ts
│   │   ├── types/               # TypeScript types
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🎓 Learning Points & Best Practices

### Backend Best Practices
1. **Clean Architecture**: Separation of API, business logic, and data access
2. **Dependency Injection**: Database sessions injected via FastAPI's `Depends`
3. **Type Hints**: Full Python type annotations for IDE support
4. **Error Handling**: Proper HTTP status codes and error messages
5. **Database Migrations**: Schema changes tracked (would use Alembic in production)

### Frontend Best Practices
1. **Type Safety**: TypeScript interfaces for all API responses
2. **Context API**: Centralized auth state management
3. **Protected Routes**: Higher-order component pattern
4. **API Abstraction**: All API calls in dedicated service layer
5. **Token Management**: Automatic JWT injection via Axios interceptors

### AI/ML Best Practices
1. **Model Selection**: Chose efficient model (all-MiniLM-L6-v2) for CPU inference
2. **Vector Normalization**: L2 normalization for cosine similarity
3. **Index Persistence**: FAISS index saved to disk for restart resilience
4. **Embedding Caching**: Embeddings computed once per document, reused for all searches



**Common Issues:**
- Port 8000 already in use: Change port in uvicorn command
- MySQL connection refused: Start MySQL service
- Module not found: Reinstall requirements.txt
- FAISS import error: Install faiss-cpu correctly

---

