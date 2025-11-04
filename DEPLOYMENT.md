# Deployment Guide for ProjectFlow

This guide explains how to deploy the ProjectFlow application to Vercel (frontend) and a Node.js hosting platform (backend).

## Prerequisites

1. Create accounts on:
   - [Vercel](https://vercel.com/)
   - A Node.js hosting platform (e.g., [Render](https://render.com/), [Railway](https://railway.app/), or [Heroku](https://heroku.com/))

2. Have your MongoDB connection string ready (from MongoDB Atlas or your MongoDB server)

## Step 1: Deploy the Backend (Server)

1. Choose a hosting platform for your Node.js backend:
   - Render, Railway, or Heroku are good options
   - For this guide, we'll use Render as an example

2. Create a new Web Service on Render:
   - Connect your GitHub repository
   - Set the root directory to `server/`
   - Set the build command to `npm install`
   - Set the start command to `node server.js`
   - Add environment variables:
     - `NODE_ENV` = `production`
     - `MONGO_URI` = `your_mongodb_connection_string`
     - `JWT_SECRET` = `your_jwt_secret_key`
     - Any other environment variables your app requires

3. Deploy the service and note the URL of your deployed backend

## Step 2: Update Frontend Configuration

1. Update the `.env.production` file in your project root:
   ```
   REACT_APP_API_BASE_URL=your_deployed_backend_url
   NODE_ENV=production
   ```

2. Commit and push your changes to GitHub

## Step 3: Deploy the Frontend (Client) to Vercel

1. Go to [Vercel](https://vercel.com/) and sign in

2. Click "New Project"

3. Import your GitHub repository

4. Configure the project:
   - Set the root directory to `client/`
   - Framework preset should be "Create React App"
   - Environment variables:
     - Add all variables from your `.env.production` file

5. Deploy the project

6. After deployment, Vercel will provide you with a URL for your frontend

## Step 4: Update Backend CORS Settings (if needed)

If you encounter CORS issues, update your server's CORS configuration in `server.js`:

```javascript
if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: "*",
    credentials: true
  }));
} else {
  app.use(cors({
    origin: "your_frontend_vercel_url",
    credentials: true
  }));
}
```

## Step 5: Test Your Deployment

1. Visit your frontend URL
2. Try logging in/registering
3. Test various features to ensure everything works correctly

## Troubleshooting

- If you see "404" errors for API calls, check that your `REACT_APP_API_BASE_URL` is set correctly
- If you see CORS errors, verify your backend CORS configuration
- If the app fails to connect to the database, check your `MONGO_URI` environment variable
- If you encounter npm peer dependency conflicts (especially with Cloudinary), ensure you're using compatible versions:
  - `cloudinary`: `^1.41.3`
  - `multer-storage-cloudinary`: `^4.0.0`
  - Add `legacy-peer-deps=true` to `.npmrc` files
- If you see "No Output Directory named 'public' found", check your `vercel.json` configuration and ensure it points to the correct build directory (`client/build`)

## Additional Notes

- Make sure to replace placeholder values with actual values
- Keep your environment variables secure and never commit them to version control
- Consider setting up custom domains for both frontend and backend