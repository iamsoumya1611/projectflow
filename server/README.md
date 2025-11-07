# ProjectFlow Server

This is the backend server for the ProjectFlow application, built with Node.js, Express, and MongoDB.

## Project Structure

```
server/
├── config/          # Database configuration
├── controllers/     # Request handlers
├── middleware/      # Custom middleware functions
├── models/          # MongoDB data models
├── routes/          # API route definitions
├── utils/           # Utility functions
├── server.js        # Main server file
└── ...
```

## Key Components

### 1. Models
Define the structure of data stored in MongoDB:
- `User` - User accounts and authentication
- `Project` - Project information and metadata
- `Task` - Individual tasks within projects
- `Message` - Chat messages
- `Attachment` - File attachments

### 2. Controllers
Handle the business logic for each resource:
- Process incoming requests
- Interact with the database
- Return appropriate responses

### 3. Routes
Define the API endpoints and connect them to controllers:
- `/api/auth` - Authentication endpoints
- `/api/users` - User management
- `/api/projects` - Project management
- `/api/tasks` - Task management
- `/api/messages` - Chat functionality

### 4. Middleware
Custom functions that process requests before they reach controllers:
- `auth` - Verify user authentication
- `admin` - Verify admin privileges
- `upload` - Handle file uploads

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables in a `.env` file:
   ```
   DEV_MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. The server will start on port 5000 by default.

## API Endpoints

All API endpoints are prefixed with `/api`:

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/projects` - Get all projects for user
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

## Development Guidelines

1. All new routes should be added to the appropriate file in the `routes/` directory
2. Business logic should be implemented in the `controllers/` directory
3. Data validation should use `express-validator`
4. Error handling should be consistent across all controllers
5. Environment variables should be used for configuration

## Common Patterns

### Authentication
Most routes require authentication using the `auth` middleware:

```javascript
router.get('/', auth, getProjects);
```

### Validation
Input validation is handled with `express-validator`:

```javascript
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty()
    ]
  ],
  createProject
);
```

### Error Handling
Controllers should handle errors gracefully:

```javascript
try {
  // Database operations
} catch (err) {
  console.error(err.message);
  res.status(500).send('Server Error');
}
```