# ProjectFlow - Project Management Tool

A comprehensive project management application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring task management, team collaboration, and real-time updates.

## Features

### Task Management
- Create, read, update, and delete tasks
- Assign tasks to team members
- Set priorities and due dates
- Add comments to tasks
- **Upload file attachments to tasks (with Cloudinary integration)**

### Project Tracking
- Create and manage projects
- View project details and progress
- Gantt chart for timeline visualization

### Workflow Visualization
- Kanban board with drag-and-drop functionality
- Task status tracking (To Do, In Progress, Review, Done)
- **Tasks organized by status in columns with drag-and-drop functionality**

### Team Collaboration
- Real-time comments on tasks and projects
- Notifications for task assignments and comments
- **File sharing with Cloudinary storage**
- Real-time chat with team members

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install client dependencies:
   ```bash
   cd client
   npm install
   ```

## Configuration

### Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Cloudinary Setup

1. Sign up for a free account at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Add these values to your `.env` file

## Running the Application

1. Start the server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the client:
   ```bash
   cd client
   npm start
   ```

The application will be available at `http://localhost:3000`.

## Deployment

For deployment instructions, please refer to [DEPLOYMENT.md](DEPLOYMENT.md) and follow the checklist in [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md).

## Key Libraries and Tools

- **React Router**: Navigation between different pages
- **JWT**: Secure way to handle user sessions
- **Socket.IO**: Real-time communication for comments and notifications
- **Tailwind CSS**: Styling framework for UI design
- **Chart.js**: Creating charts and graphs for reports
- **react-beautiful-dnd**: Drag-and-drop functionality for Kanban boards
- **Cloudinary**: Cloud-based image and file storage

## How Data Flows Through the Application

1. **Frontend (React)**: User interacts with the UI (clicking buttons, filling forms)
2. **API Requests**: Frontend sends requests to backend (e.g., "get my tasks")
3. **Backend (Express)**: Receives requests, processes them, and interacts with database
4. **Database (MongoDB)**: Stores and retrieves data
5. **Response**: Backend sends data back to frontend
6. **UI Update**: Frontend updates the display with new data

## Folder Structure

```
.
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── admin/
│       │   ├── auth/
│       │   ├── chat/
│       │   ├── dashboard/
│       │   ├── layout/
│       │   ├── projects/
│       │   ├── tasks/
│       │   └── users/
│       ├── context/
│       ├── utils/
│       ├── App.js
│       └── index.js
└── server/
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    └── server.js
```