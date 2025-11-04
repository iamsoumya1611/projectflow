# ProjectFlow Deployment Checklist

## Backend Deployment (Node.js Server)

- [ ] Choose a hosting platform (Render, Railway, Heroku, etc.)
- [ ] Create a new Web Service
- [ ] Connect GitHub repository
- [ ] Set root directory to `server/`
- [ ] Set build command to `npm install`
- [ ] Set start command to `node server.js`
- [ ] Configure environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `MONGO_URI=your_mongodb_connection_string`
  - [ ] `JWT_SECRET=your_secret_key`
  - [ ] Any other required variables
- [ ] Deploy and note the backend URL

## Frontend Deployment (React Client)

- [ ] Update `.env.production` with deployed backend URL
- [ ] Commit and push all changes to GitHub
- [ ] Create new project on Vercel
- [ ] Connect GitHub repository
- [ ] Set root directory to `client/`
- [ ] Configure environment variables:
  - [ ] `REACT_APP_API_BASE_URL=your_deployed_backend_url`
  - [ ] `NODE_ENV=production`
- [ ] Deploy and note the frontend URL

## Post-Deployment Configuration

- [ ] Update backend CORS settings if needed
- [ ] Test frontend and backend connectivity
- [ ] Verify user authentication works
- [ ] Test all major features (projects, tasks, etc.)
- [ ] Set up custom domains if needed

## Security Considerations

- [ ] Ensure environment variables are not exposed
- [ ] Verify HTTPS is enabled for both frontend and backend
- [ ] Check that sensitive data is not logged
- [ ] Review and update JWT token expiration settings
- [ ] Resolve npm peer dependency conflicts (especially Cloudinary versions)

## Monitoring and Maintenance

- [ ] Set up logging for both frontend and backend
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Set up uptime monitoring
- [ ] Plan for regular backups of your MongoDB database