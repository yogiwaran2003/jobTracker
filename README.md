# 🚀 Automated Job Application Tracker

A full-stack Kanban-style application to track job applications across different stages — from Wishlist to Offer.

Built with **React**, **Spring Boot**, and **Selenium WebDriver**.

## ✨ Features

- **Drag-and-Drop Kanban Board** — Move job cards between Wishlist, Applied, Interviewing, and Offer columns.
- **Magic URL Scraper** — Paste a job posting URL and Selenium automatically extracts the Job Title and Company Name.
- **CRUD Operations** — Add, update, and delete job applications via REST APIs.
- **Premium Dark Mode UI** — Sleek, modern design with smooth hover effects and transitions.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, @hello-pangea/dnd |
| Backend | Java 17, Spring Boot 3, Spring Data JPA |
| Database | H2 (In-Memory) |
| Automation | Selenium WebDriver (Headless Chrome) |

## 📂 Project Structure

```
job-tracker/
├── job-tracker-backend/     # Spring Boot REST API + Selenium Scraper
│   ├── src/main/java/com/capgemini/jobtracker/
│   │   ├── controller/      # REST Controllers
│   │   ├── model/           # JPA Entities & DTOs
│   │   ├── repository/      # Spring Data Repositories
│   │   └── service/         # Business Logic & Web Scraper
│   └── pom.xml
├── job-tracker-frontend/    # React Kanban Board UI
│   ├── src/
│   │   ├── components/      # JobCard, KanbanColumn, AddJobModal
│   │   ├── api.js           # API client for backend communication
│   │   └── App.jsx          # Main application with DragDropContext
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- Maven
- Google Chrome (for Selenium scraper)

### 1. Start the Backend
```bash
cd job-tracker-backend
mvn spring-boot:run
```
API runs at `http://localhost:8080`

### 2. Start the Frontend
```bash
cd job-tracker-frontend
npm install
npm run dev
```
App runs at `http://localhost:5173`

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/jobs` | Get all job applications |
| POST | `/api/jobs` | Create a new job application |
| PUT | `/api/jobs/{id}` | Update a job application |
| PATCH | `/api/jobs/{id}/status` | Update job status (drag-and-drop) |
| DELETE | `/api/jobs/{id}` | Delete a job application |
| GET | `/api/jobs/scrape?url=...` | Scrape job details from a URL |

## 👨‍💻 Author

Built as a portfolio project demonstrating full-stack development with Java, React, and QA Automation (Selenium).
