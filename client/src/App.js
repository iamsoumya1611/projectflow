import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import Projects from './components/projects/Projects';
import ProjectDetail from './components/projects/ProjectDetail';
import Tasks from './components/tasks/Tasks';
import TaskDetail from './components/tasks/TaskDetail';
import Reporting from './components/dashboard/Reporting';
import GanttChart from './components/projects/GanttChart';
import Chat from './components/chat/Chat';
// Admin components
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProjectForm from './components/admin/AdminProjectForm';
import AdminTaskForm from './components/admin/AdminTaskForm';
import AdminTasks from './components/admin/AdminTasks';
import AdminProjects from './components/admin/AdminProjects';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/projects/edit/:id" element={<ProjectDetail />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/tasks/edit/:id" element={<TaskDetail />} />
              <Route path="/reports" element={<Reporting />} />
              <Route path="/gantt" element={<GanttChart />} />
              <Route path="/chat" element={<Chat />} />
              {/* Admin routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/projects" element={<AdminProjects />} />
              <Route path="/admin/projects/new" element={<AdminProjectForm />} />
              <Route path="/admin/projects/edit/:id" element={<AdminProjectForm />} />
              <Route path="/admin/tasks" element={<AdminTasks />} />
              <Route path="/admin/tasks/new" element={<AdminTaskForm />} />
              <Route path="/admin/tasks/edit/:id" element={<AdminTaskForm />} />
              <Route path="/admin/reports" element={<Reporting />} />
              <Route path="/admin/gantt" element={<GanttChart />} />
              <Route path="/admin/chat" element={<Chat />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;