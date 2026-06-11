# TaskFlow — Role-Based Task Management System

A full-stack task management application built with **Node.js**, **MongoDB**, and **React.js** featuring role-based access control, admin dashboard, and activity logging.

## Features

### Authentication & Authorization
- JWT-based authentication with secure password hashing (bcrypt)
- Role-based access control — Admin and User roles
- Protected routes with middleware chain (`protect → authorize`)
- Inactive account detection blocks login even with valid tokens

### User (Regular)
- Create, view, update, and delete personal tasks
- Filter tasks by status (pending, in-progress, completed)
- Set task priority (low, medium, high) and due dates
- Dashboard with personal task statistics

### Admin
- **User Management** — View all users, toggle Active/Inactive status, delete users (cascade deletes their tasks)
- **Task Monitoring** — View and delete any task across all users
- **Activity Logs** — Chronological audit trail with action filtering and pagination
- **Analytics Dashboard** — Total users, tasks, completion rates, active/inactive counts

### Activity Logging
Automatic tracking of:
- Login events
- Task creation, updates, and deletions
- User status changes
- User deletions (admin)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Frontend | React 18 (Vite) |
| Routing | React Router v6 |
| State | React Context API |
| HTTP Client | Axios |
| Styling | CSS Modules |
| Icons | Lucide React |
| Notifications | React Hot Toast |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (React)                    │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │  Context  │  │  Pages   │  │    Components     │  │
│  │  (Auth)   │──│(Dashboard│──│(Layout, Modal,    │  │
│  │          │  │ Tasks...)│  │ StatusBadge...)   │  │
│  └──────────┘  └──────────┘  └───────────────────┘  │
│         │            │                               │
│    ┌────┴────────────┴──────┐                        │
│    │  Axios Instance        │                        │
│    │  (interceptors, auth)  │                        │
│    └────────────┬───────────┘                        │
└─────────────────┼───────────────────────────────────┘
                  │ HTTP (REST)
┌─────────────────┼───────────────────────────────────┐
│                 │       Server (Express)             │
│    ┌────────────┴───────────┐                        │
│    │       Routes           │                        │
│    │  /auth /tasks /admin   │                        │
│    └────────────┬───────────┘                        │
│    ┌────────────┴───────────┐                        │
│    │     Middleware          │                        │
│    │  protect → authorize   │                        │
│    └────────────┬───────────┘                        │
│    ┌────────────┴───────────┐                        │
│    │     Controllers        │                        │
│    │  (business logic)      │                        │
│    └────────────┬───────────┘                        │
│    ┌────────────┴───────────┐                        │
│    │     Mongoose Models    │                        │
│    │  User, Task, Activity  │                        │
│    └────────────┬───────────┘                        │
└─────────────────┼───────────────────────────────────┘
                  │
            ┌─────┴─────┐
            │  MongoDB   │
            └───────────┘
```

## Folder Structure

```
├── server/
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js      # Register, login, getMe
│   │   ├── task.controller.js      # Task CRUD (scoped to user)
│   │   ├── admin.controller.js     # User/task management, analytics
│   │   └── activityLog.controller.js
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification + inactive check
│   │   ├── authorize.js            # Role-based access
│   │   └── errorHandler.js         # Global error formatting
│   ├── models/
│   │   ├── User.js                 # User schema with bcrypt hooks
│   │   ├── Task.js                 # Task schema with indexes
│   │   └── ActivityLog.js          # Audit trail with static log()
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── task.routes.js
│   │   ├── admin.routes.js
│   │   └── activityLog.routes.js
│   ├── utils/
│   │   └── ApiError.js             # Custom error class
│   ├── server.js                   # Express app entry point
│   ├── seed.js                     # Admin user seeder
│   └── .env.example
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js            # Axios instance + interceptors
│   │   ├── components/
│   │   │   ├── Layout/             # Sidebar, Header, AppLayout
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Auth state + login/register/logout
│   │   ├── hooks/
│   │   │   └── useApi.js           # Reusable API call wrapper
│   │   ├── pages/
│   │   │   ├── admin/              # UserManagement, TaskMonitoring, ActivityLogs
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Tasks.jsx
│   │   ├── utils/
│   │   │   └── formatters.js       # Date/string utilities
│   │   ├── App.jsx                 # Routes + providers
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Global styles + design tokens
│   ├── index.html
│   └── .env.example
│
├── README.md
└── .gitignore
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB running locally on default port (27017)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repo-url>
cd avidus-task-manager
git checkout feature/role-based-access
```

### 2. Backend Setup
```bash
cd server
cp .env.example .env        # then edit .env if needed
npm install
npm run seed                 # creates admin user
npm run dev                  # starts server on port 5000
```

### 3. Frontend Setup
```bash
cd client
cp .env.example .env
npm install
npm run dev                  # starts dev server on port 5173
```

### 4. Default Admin Credentials
```
Email:    admin@avidus.com
Password: admin123
```

## Environment Variables

### Server (`server/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/avidus-task-manager` |
| `JWT_SECRET` | Secret key for JWT signing | — |
| `JWT_EXPIRE` | Token expiration time | `7d` |
| `PORT` | Server port | `5000` |

### Client (`client/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

## API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login with credentials |
| GET | `/api/auth/me` | Protected | Get current user profile |

### Tasks
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tasks` | Protected | Get user's tasks |
| POST | `/api/tasks` | Protected | Create a task |
| PUT | `/api/tasks/:id` | Protected | Update own task |
| DELETE | `/api/tasks/:id` | Protected | Delete own task |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/admin/users` | Admin | List all users |
| DELETE | `/api/admin/users/:id` | Admin | Delete a user (+tasks) |
| PATCH | `/api/admin/users/:id/status` | Admin | Toggle user status |
| GET | `/api/admin/tasks` | Admin | List all tasks |
| DELETE | `/api/admin/tasks/:id` | Admin | Delete any task |
| GET | `/api/admin/analytics` | Admin | Get dashboard statistics |
| GET | `/api/activity-logs` | Admin | Get paginated activity logs |

## Assumptions

1. **Task status values** are lowercase: `pending`, `in-progress`, `completed`
2. **User deletion** cascades — deleting a user removes all their tasks
3. **No self-service role change** — only one seeded admin exists (expandable via seed script)
4. **JWT in Authorization header** (Bearer token) rather than httpOnly cookies — standard for SPAs
5. **Activity logs** are never deleted — they serve as an audit trail
6. **Client-side filtering** for user management search (adequate for expected data size)

## Tradeoffs

| Decision | Why |
|----------|-----|
| Context API over Redux | Only 2-3 pieces of global state — Redux would be overkill |
| CSS Modules over Tailwind | Scoped styles, shows actual CSS skill, no extra build config |
| Vite over CRA | CRA is deprecated, Vite is the modern standard |
| Bearer token over httpOnly cookie | Simpler for SPA, widely understood pattern |
| `Promise.all` in analytics | Parallel DB queries instead of sequential — ~3x faster |
| Client-side search in UserManagement | Fine for 100s of users; server-side pagination would be added at scale |

## Performance Considerations

- **Database indexes** on `Task.createdBy` and `ActivityLog.createdAt` for fast queries
- **Parallel aggregation** in analytics endpoint using `Promise.all`
- **Password excluded** from queries by default (`select: false`)
- **Token verification** rejects inactive users at middleware level (no unnecessary DB queries downstream)
- **Pagination** on activity logs to avoid loading entire audit trail

## Future Improvements

- [ ] Add password reset flow with email verification
- [ ] Implement refresh token rotation
- [ ] Add task assignment (admin assigns tasks to users)
- [ ] Add real-time notifications via WebSocket
- [ ] Implement server-side search and pagination for all list endpoints
- [ ] Add rate limiting middleware for auth endpoints
- [ ] Write unit tests for controllers and integration tests for API
- [ ] Add Docker Compose for one-command development setup

## Testing

### Manual Testing Checklist
1. Register a new user → verify account creation
2. Login → verify token and redirect
3. Create/edit/delete tasks → verify CRUD operations
4. Login as admin → verify dashboard stats load
5. Toggle user status → verify login blocking
6. Delete user → verify cascade delete of tasks
7. Check activity logs → verify all actions tracked
8. Access admin routes as regular user → verify 403

### Running the Application
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Open `http://localhost:5173` in your browser.
