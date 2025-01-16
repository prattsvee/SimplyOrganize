# Simply Organize - Modern Task Management System

## Overview
Simply Organize is a comprehensive task management solution built with a microservices architecture, offering robust project management capabilities with real-time updates, team collaboration features, and an intuitive Kanban-style interface.

## Tech Stack

### Frontend
- **React + Vite** - For a modern, fast development experience
- **TypeScript** - For type safety and better developer experience
- **Tailwind CSS** - For utility-first styling
- **React Beautiful DND** - For drag-and-drop Kanban functionality
- **Axios** - For API communication
- **SignalR Client** - For real-time updates

### Backend (Task Management Service)
- **.NET 7.0** - Core backend framework
- **Entity Framework Core** - ORM for database operations
- **PostgreSQL** - Primary database
- **SignalR** - For real-time communication
- **Swagger** - API documentation

### Authentication Service
- Separate microservice handling user authentication and authorization
- JWT token-based authentication
- Role-based access control

## Key Features

### Project Management
- Create and manage multiple projects
- Project status tracking
- Team member assignment
- Progress monitoring
- Project analytics and reporting

### Task Management
- Kanban board interface
- Real-time task updates
- Task prioritization
- Status tracking
- File attachments
- Comment system
- Task filtering and search

### Team Collaboration
- Team member management
- Real-time notifications
- Activity tracking
- Comment threads on tasks
- File sharing capabilities

## Architecture

graph TD
    subgraph "Frontend Layer"
        UI[React + Vite UI]
        SignalRC[SignalR Client]
    end

    subgraph "API Gateway"
        Gateway[API Gateway]
    end

    subgraph "Task Management Service"
        TaskAPI[Task API]
        ProjectAPI[Project API]
        SignalRS[SignalR Server]
        TaskService[Task Service]
        ProjectService[Project Service]
        EF[Entity Framework Core]
    end

    subgraph "Auth Service"
        AuthAPI[Auth API]
        UserService[User Service]
        JWTService[JWT Service]
    end

    subgraph "Databases"
        PostgreSQL[(PostgreSQL)]
        UserDB[(User DB)]
    end

    UI --> Gateway
    SignalRC --> SignalRS
    Gateway --> TaskAPI
    Gateway --> AuthAPI
    Gateway --> ProjectAPI
    
    TaskAPI --> TaskService
    ProjectAPI --> ProjectService
    AuthAPI --> UserService
    AuthAPI --> JWTService
    
    TaskService --> EF
    ProjectService --> EF
    EF --> PostgreSQL
    UserService --> UserDB

```
├── Frontend (React + Vite)
│   ├── Components
│   │   ├── Project Management
│   │   ├── Task Management
│   │   ├── Team Management
│   │   └── Common UI Elements
│   ├── Services
│   │   ├── API Integration
│   │   └── Real-time Updates
│   └── State Management
│
├── Backend (Task Management)
│   ├── Controllers
│   ├── Services
│   ├── Models
│   ├── Data Access
│   └── SignalR Hubs
│
└── Auth Service
    ├── User Management
    ├── Authentication
    └── Authorization
```

## Running the Project

### Prerequisites
- Node.js 16+
- .NET 7.0 SDK
- PostgreSQL 13+
- Docker (optional)

### Development Setup
1. Clone the repository
```bash
git clone https://github.com/yourusername/SimplyOrganize.git
```

2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

3. Backend Setup
```bash
cd backend
dotnet restore
dotnet run
```

4. Database Setup
```bash
# Update connection string in appsettings.json
dotnet ef database update
```

## Future Enhancements
- Enhanced analytics dashboard
- Time tracking functionality
- Integration with popular version control systems
- Mobile application
- Extended reporting capabilities
- AI-powered task suggestions
