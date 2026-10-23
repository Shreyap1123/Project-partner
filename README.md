# 🤝 ProjectPartner - Academic Teammate & Project Discovery Platform

**ProjectPartner** is a full-stack collaborative platform designed specifically for university students to find compatible teammates for academic projects, capstones, research, and hackathons based on algorithmic skill scoring, domain affinities, and availability.

---

## 🌟 Key Features & Modules

1. **User Registration & Auth**:
   - Spring Security with stateless JWT Bearer token authentication.
   - `BCryptPasswordEncoder` for salted one-way password hashing.
   - Role-based authorization (`ROLE_STUDENT`, `ROLE_ADMIN`).
   - One-click demo persona switcher in the navbar to quickly test multiple student and admin perspectives.

2. **Student Profile, Skills & Portfolio**:
   - Comprehensive profile: University, department, degree level, graduation year, bio, contact links, and avatar.
   - 35+ pre-seeded tech skills across 8 domains (`FRONTEND`, `BACKEND`, `DATABASE`, `AI_ML`, `MOBILE`, `DEVOPS`, `UI_UX`, `DATA_SCIENCE`) with 4-tier proficiency ratings (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT`).
   - Past project showcase with GitHub repository and live demo links.

3. **Algorithmic Skill Matching & Teammate Recommendation Engine**:
   - Compatibility scoring algorithm:
     $$\text{MatchScore} = \left( \frac{\sum_{s \in S_{\text{matched}}} W(s)}{\sum_{s \in S_{\text{required}}} W_{\text{max}}(s)} \times 70\% \right) + (\text{DomainOverlap} \times 20\%) + (\text{AvailabilityFit} \times 10\%)$$
   - Color-coded match gauge (Emerald for 85%+, Indigo for 70-84%, Amber for 50-69%).
   - Explicit skill comparison (highlighted green badges for matched skills, muted tags for missing skills).
   - Automated recommendation rationale.
   - Filter candidates by specific skills, university department, and minimum weekly availability hours.

4. **Team Request Lifecycle**:
   - Bi-directional flow: Students can submit **Join Applications** with a pitch, and Project Leaders can send direct **Invitations** to top matches.
   - States: `PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`.
   - Accepting a request automatically adds the student to the project roster as a `TeamMember` and updates open slots.

5. **Team Workspace & Management**:
   - Project creation with title, description, domain category, max team size, and dynamic required-skills builder.
   - Team roster with role assignments (`LEADER`, `FRONTEND_DEV`, `BACKEND_DEV`, `FULLSTACK_DEV`, `MOBILE_DEV`, `AI_ML_DEV`, `UI_UX_DESIGNER`, `DEVOPS_ENG`, `RESEARCHER`).
   - Project leader privileges to manage members, re-open recruitment, and update project status (`RECRUITING`, `IN_PROGRESS`, `COMPLETED`, `ARCHIVED`).
   - Team discussion board / bulletin for internal team coordination.

6. **Project Progress & Agile Kanban Board**:
   - Milestone tracking with due dates and statuses (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`).
   - 4-column sprint Kanban board: `To Do`, `In Progress`, `Under Review`, `Completed`.
   - Task cards with priority badges (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), assignees, and quick column progression.
   - Dynamic sprint progress percentage calculation.

7. **Admin Module**:
   - Platform analytics: Total students, active projects, matchmaking rate %, and pending requests.
   - Visual distribution breakdown of project domains and top platform skills.
   - Student directory with active/suspended status toggle.
   - Project moderation with content inspection and deletion.
   - Skill dictionary management (add/remove platform skills).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 8+ / Spring Boot 2.7.18 / Spring Security / Spring Data JPA |
| **Authentication** | JJWT 0.11.5 (JSON Web Tokens) + BCrypt |
| **Build Tool** | Bundled Apache Maven 3.8.8 (`backend/mvnw.cmd`) |
| **Database** | MySQL 8.0 (with zero-config in-memory H2 dev fallback) |
| **Frontend** | React 18 + Vite |
| **Styling** | Vanilla CSS (Dark/Light mode, Glassmorphism, CSS Grid, Micro-animations) |
| **Icons** | Lucide React |

---

## 🚀 Getting Started

### Prerequisites
- **Java**: JDK 8 or higher (tested with `C:\Program Files\Java\jdk1.8.0_144` and modern JDKs).
- **Node.js**: v18+ and `npm`.

---

### 1. Running the Backend

The backend is configured with the bundled Maven wrapper:

```powershell
# From the project root:
$env:JAVA_HOME = "C:\Program Files\Java\jdk1.8.0_144"
.\backend\mvnw.cmd spring-boot:run -f backend/pom.xml
```

The Spring Boot backend will start at:
👉 **`http://localhost:8080`**

#### Database Configuration:
- **Default Profile (`h2`)**: Starts automatically in-memory with pre-seeded sample data (no configuration or external database installation needed).
- **MySQL Profile (`mysql`)**: To connect to your local MySQL 8 instance:
  1. Create the database in MySQL:
     ```sql
     CREATE DATABASE IF NOT EXISTS projectpartner_db;
     ```
  2. Set the environment variables in PowerShell and start the backend:
     ```powershell
     $env:SPRING_PROFILES_ACTIVE = "mysql"
     $env:DB_PASSWORD = "your_mysql_root_password"
     .\backend\mvnw.cmd spring-boot:run -f backend/pom.xml
     ```

---

### 2. Running the Frontend

```powershell
cd frontend
npm install
npm run dev
```

The React frontend will start at:
👉 **`http://localhost:5173`**

The Vite development server is pre-configured to proxy `/api` requests directly to `http://localhost:8080`.

---

## 👥 Demo Accounts (Pre-Seeded)

Use any of the following accounts or use the **Demo Persona Switcher** in the top navigation bar:

| Name | Role / Specialty | Email | Password |
|---|---|---|---|
| **Sarah Jenkins** | AI Specialist & Project Lead | `sarah@campus.edu` | `password123` |
| **Alex Chen** | Full Stack Lead & Project Lead | `alex@campus.edu` | `password123` |
| **Priya Patel** | UI/UX Designer & Project Lead | `priya@campus.edu` | `password123` |
| **Elena Rostova** | Candidate (NLP Researcher) | `elena@campus.edu` | `password123` |
| **Marcus Vance** | Backend Specialist (Spring/Docker) | `marcus@campus.edu` | `password123` |
| **David Kim** | Mobile Dev (Flutter) | `david@campus.edu` | `password123` |
| **Admin** | Platform Administrator | `admin@projectpartner.com` | `admin123` |

---

## 📡 REST API Summary

### Auth
- `POST /api/auth/register` — Register a student account
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/me` — Current authenticated user details

### Profiles & Skills
- `GET /api/profiles/me` — Authenticated student's profile & skills
- `PUT /api/profiles/me` — Update bio, university, availability, social links
- `GET /api/profiles/{userId}` — Public profile of another student
- `POST /api/profiles/me/skills` — Add or update a skill proficiency
- `DELETE /api/profiles/me/skills/{skillId}` — Remove a skill
- `POST /api/profiles/me/projects` — Add a past showcase project
- `DELETE /api/profiles/me/projects/{id}` — Delete a showcase project

### Skill Matching & Recommendations
- `GET /api/recommendations/teammates/{projectId}` — Ranked teammate recommendations for a project
- Query params: `?skill=Python&department=Computer Science&minHours=10`

### Team Requests
- `POST /api/team-requests/apply` — Student applies to join an open project
- `POST /api/team-requests/invite` — Project leader invites a candidate
- `PUT /api/team-requests/{id}/respond?status=ACCEPTED|REJECTED` — Accept or reject
- `PUT /api/team-requests/{id}/cancel` — Cancel an outgoing request
- `GET /api/team-requests/incoming` — Incoming requests for current user or their projects
- `GET /api/team-requests/outgoing` — Outgoing applications and invitations sent

### Projects & Team Workspace
- `GET /api/projects` — List open projects with filters (domain, status, search)
- `GET /api/projects/{id}` — Get full project details, requirements & team roster
- `POST /api/projects` — Create a new academic project posting
- `PUT /api/projects/{id}` — Update project details or status
- `DELETE /api/projects/{id}` — Delete project (Leader only)
- `DELETE /api/projects/{id}/members/{userId}` — Remove a team member (Leader only)
- `GET /api/projects/{id}/messages` — Team discussion board messages
- `POST /api/projects/{id}/messages` — Post a team bulletin message

### Project Progress & Kanban
- `GET /api/progress/{projectId}` — Progress stats, milestones, and sprint tasks
- `POST /api/progress/{projectId}/milestones` — Create a milestone
- `PUT /api/progress/milestones/{id}` — Update milestone details or status
- `POST /api/progress/{projectId}/tasks` — Create a sprint task
- `PUT /api/progress/tasks/{id}` — Update task details, status, or assignee

### Admin Module
- `GET /api/admin/stats` — Platform metrics and domain/skill distribution
- `GET /api/admin/users` — User directory
- `PUT /api/admin/users/{id}/status` — Toggle user active/suspended state
- `GET /api/admin/projects` — Project moderation list
- `DELETE /api/admin/projects/{id}` — Delete project posting
- `GET /api/admin/skills` — Skill dictionary
- `POST /api/admin/skills` — Add new skill to platform
- `DELETE /api/admin/skills/{id}` — Remove skill
