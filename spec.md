# College Complaint & Grievance Management System (CampusResolve)

## Project Overview
A full-stack, enterprise-grade College Grievance & Complaint Management System that streamlines how students report issues (hostel, academics, infrastructure, library, mess, transportation, fees, etc.), and empowers college administration and department staff to track, assign, resolve, and analyze grievances with AI assistance and real-time updates.

## Core Features & Requirements

### 1. Authentication & Role-Based Access Control (RBAC)
- **Roles**: Student, Department Staff / Faculty, Admin, Super Admin
- **Authentication**: JWT-based secure authentication, password hashing (bcryptjs)
- **Profiles**: Student ID/Roll Number, Department, Semester, Contact info, Avatar

### 2. Student Portal & Complaint Submission
- **Complaint Submission Form**:
  - Title, Category/Department (Academics, Hostel, Mess, Infrastructure, Library, Accounts, Transport, Wi-Fi/IT, Sports, Sanitation)
  - Detailed Description with Rich Text / Markdown
  - File / Photo attachments (images, documents)
  - Priority selection (Low, Medium, High, Critical)
  - Location/Block/Room (optional for hostel/campus maintenance)
  - Anonymous submission toggle (protect student identity if requested)
- **Unique Tracking Code / Ticket ID** (e.g. `CMP-2026-8910`)
- **My Complaints Dashboard**:
  - Filter by status, category, date
  - Real-time status badge
  - Timeline view with audit history & admin comments
- **Student Feedback & Resolution Rating** (1-5 stars + review comment after resolution)

### 3. Admin & Staff Management Portal
- **Department/Staff Assignment**: Assign complaints to specific department heads or staff members
- **Complaint Status Management**:
  - `Submitted` → `Under Review` → `Assigned` → `In Progress` → `Resolved` → `Closed`
- **Priority Override & SLA Tracking**: Low / Medium / High / Critical with SLA breach countdown
- **Admin Comments & Internal Notes**: Public updates (visible to student) + Private internal staff notes
- **Resolution Details & Proof**: Resolution notes, before/after attachments, closing remarks
- **Search, Filter & Bulk Actions**: Multi-faceted filter by status, priority, department, date range, search by keyword or ticket ID

### 4. Database & CRUD API Functionality
- **RESTful API**: Comprehensive CRUD endpoints for complaints, users, departments, comments, analytics
- **Data Persistence**: MongoDB with Mongoose schemas (and robust in-memory fallback for immediate zero-config local run)
- **Data Validation**: Request payload validation, sanitization, error handling

### 5. Analytics & Department-Wise Statistics
- **Admin Analytics Dashboard**:
  - Total complaints, pending, in-progress, resolved, SLA compliance rate
  - Average resolution time (hours/days)
  - Department-wise breakdown & heatmaps
  - Category distribution charts
  - Student satisfaction score & rating trends
  - Export reports (CSV, JSON, PDF)

### 6. AI-Powered Smart Capabilities
- **AI-Based Auto-Categorization & Department Routing**: Automatically suggest category & assigned department based on complaint description
- **AI-Generated Complaint Summaries**: Concise summaries for quick triage by busy administrators
- **AI Priority Assessment & Sentiment Analysis**: Detect urgency and emotional distress
- **Duplicate Complaint Detection**: Flag similar complaints lodged by multiple students for the same issue (e.g., "WiFi down in Block B")

### 7. Real-Time Updates & Notifications
- **Real-Time Status Notifications**: WebSockets (Socket.IO) for live status transitions and new comments
- **Automated Escalation System**: Automatically escalate high/critical priority complaints or SLA breaches to Higher Authority/Principal
- **In-App Notification Center**: Unread count badge, audio chime option, instant alerts

### 8. Modern UI/UX & Responsive Design
- **Aesthetic**: Modern, clean, glassmorphic dark/light UI with Tailwind CSS, smooth animations, Lucide icons
- **Responsive**: 100% mobile-friendly with PWA-ready layout and bottom bar navigation for mobile students
- **Zero-Friction Local Run**: Single command startup (`npm run dev`) with concurrent frontend and backend

## Suggested Complaint Status Flow
`Submitted` → `Under Review` → `Assigned` → `In Progress` → `Resolved` → `Closed`
