# PathFinder - Smart Internship & Job Management System (Frontend)

##  Description

PathFinder is a comprehensive web application designed to bridge the gap between students seeking internships/jobs and companies looking for fresh talent. The platform provides separate dashboards for students, companies, and administrators, enabling seamless job posting, application tracking, and platform management.

This repository contains the **frontend** of the application, built with React.js, featuring modern UI components including interactive dashboards, data tables, cards, and real-time charts.

##  Features

### For Students
- **User Authentication**: Secure registration and login system
- **Profile Management**: Create and edit professional profiles with skills, education, and CV upload
- **Job Discovery**: Browse and search/filter job listings by title, skills, and company
- **Application Tracking**: Apply to jobs and track application status in real-time
- **Status Dashboard**: View application statuses (Pending, Shortlisted, Accepted, Rejected)

### For Companies
- **Company Profile**: Manage company information and branding
- **Job Management**: Post, edit, and delete job listings with details (title, description, skills, deadline, salary)
- **Applicant Tracking**: View applicants per job and update their application status
- **Analytics Dashboard**: Monitor job posting trends and application statistics

### For Administrators
- **User Management**: CRUD operations for students and companies
- **Company Verification**: Approve or reject company registrations
- **Platform Analytics**: View comprehensive reports and platform activity
- **System Oversight**: Monitor all platform activities from a central dashboard

### Analytics & Reports
- Jobs posted per month (trend analysis)
- Applications per job (bar charts)
- Application status distribution (pie charts)
- Real-time data visualization

## System Architecture

~~~
User Browser
↓
Frontend (React + Vite)
↓
Vercel Cloud Hosting
↓
Backend API (.NET - Azure Web App)
↓
Azure SQL Database
~~~

---

## Technology Stack

| Category | Technology |
|-----------|------------|
| Framework | React |
| Build Tool | Vite |
| Language | JavaScript |
| Package Manager | npm |
| Routing | React Router |
| API Communication | Axios |
| Deployment | Vercel |
| Version Control | GitHub |

---

## Repository Structure
```
PathFinder_frontend/
│
├── node_modules/ # Installed dependencies
├── public/ # Static public assets
│
├── src/
│ ├── assets/ # Images and static resources
│ ├── components/ # Reusable UI components
│ ├── context/ # React context/state management
│ ├── pages/ # Application pages
│ ├── services/ # API service configuration
│ ├── App.jsx # Main application component
│ ├── App.css
│ ├── index.css
│ └── main.jsx # Application entry point
│
├── index.html # Root HTML file
├── package.json # Project dependencies & scripts
├── package-lock.json
├── vite.config.js # Vite configuration
├── vercel.json # Vercel deployment configuration
├── eslint.config.js # ESLint configuration
├── .gitignore
└── README.md
```
---
## Local Development Setup

### Prerequisites
- Node.js (LTS Version)
- npm
- Git

---

### Clone Repository

```bash
git clone https://github.com/Jenitha23/PathFinder_frontend.git
cd PathFinder_frontend
```
Install Dependencies
```
npm install
```
Run Development Server
```
npm run dev
```
Local Application URL:  http://localhost:5173/
### Environment Configuration

Backend API Configuration
- The frontend communicates with the backend REST API through a centralized API configuration file.
- Backend base URL is configured in: src/services/api.js
```
Example configuration:

const API_BASE_URL =
  "https://pathfinder-fqgwf0e6bvc2cmbq.southeastasia-01.azurewebsites.net";

export default API_BASE_URL;
```
All frontend API requests are routed through this base URL.

Production Deployment
- Frontend is deployed using Vercel.
- Live Application : https://pathfinder-frontend-navy.vercel.app/

### Deployment Workflow
- Code pushed to GitHub
- Vercel automatically builds project
- Production deployment triggered
- Live application updated automatically

Build for Production
```
npm run build
```
Frontend communicates with backend REST APIs using the configured base URL.
```
Example API Call:

/api/auth/login
/api/student/profile
/api/company/dashboard
```
### Security Practices
- No sensitive credentials stored in frontend
- Backend authentication handled using JWT tokens
- HTTPS communication enabled in production
- Environment variables used for API configuration

### DevOps Integration
- Source code managed using GitHub
- Continuous deployment handled by Vercel
- Backend integrated through cloud API endpoints
- Supports automated deployment workflow

## Troubleshooting
API Not Connecting
- Verify backend URL in api.js
- Restart development server after env changes
- Blank Page After Refresh
- Ensure SPA routing rewrite exists in vercel.json

## Contributors
PathFinder Development Team
