# FAMS Store Deployment Guide

This guide provides instructions for deploying the FAMS Store application to production environments.

## Backend Deployment (Render)

### Prerequisites
- A [Render](https://render.com) account
- Your GitHub repository connected to Render
- A MongoDB Atlas account with a cluster set up

### Deployment Steps

1. **Login to Render**
   - Go to [dashboard.render.com](https://dashboard.render.com) and sign in

2. **Create a New Web Service**
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Select the repository containing the FAMS Store application

3. **Configure the Web Service**
   - Name: `fams-store-api` (or your preferred name)
   - Environment: `Node`
   - Region: Choose the region closest to your users
   - Branch: `main` (or your main branch)
   - Root Directory: `server` (important: specify the server subdirectory)
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free (or select a paid plan for production use)

4. **Add Environment Variables**
   Check the `.env.production` file in the server directory for the required variables. At minimum, add:

   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render will override this with its own port)
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string for JWT authentication
   - `ENCRYPTION_KEY`: A secure random string for encryption
   - `CLIENT_URL`: Your frontend URL (after deploying to Vercel)
   - `CORS_ORIGIN`: Your frontend URL (same as CLIENT_URL)
   - Add all other environment variables from `.env.production`

5. **Deploy the Service**
   - Click "Create Web Service"
   - Wait for the deployment to complete (this may take a few minutes)
   - Once deployed, note the URL provided by Render (e.g., `https://fams-store-api.onrender.com`)

## Frontend Deployment (Vercel)

### Prerequisites
- A [Vercel](https://vercel.com) account
- Your GitHub repository connected to Vercel

### Deployment Steps

1. **Login to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in

2. **Import Your Project**
   - Click "Add New..." and select "Project"
   - Import your GitHub repository

3. **Configure the Project**
   - Framework Preset: Select "Vite"
   - Root Directory: `client` (important: specify the client subdirectory)
   - Build and Output Settings:
     - Build Command: `npm run build` (default)
     - Output Directory: `dist` (default for Vite)
   - Environment Variables:
     - `VITE_API_URL`: Your Render backend URL (e.g., `https://fams-store-api.onrender.com`)
     - `VITE_SOCKET_URL`: Same as your backend URL

4. **Deploy the Project**
   - Click "Deploy"
   - Wait for the deployment to complete
   - Once deployed, Vercel will provide you with a URL (e.g., `https://fams-store.vercel.app`)

5. **Update Backend CORS Settings**
   - Go back to your Render dashboard
   - Select your backend service
   - Update the `CORS_ORIGIN` and `CLIENT_URL` environment variables to match your Vercel URL
   - Save changes and wait for the backend to redeploy

## Custom Domain Setup (Optional)

### Vercel (Frontend)
1. Go to your project settings in Vercel
2. Navigate to the "Domains" section
3. Add your custom domain
4. Follow Vercel's DNS configuration instructions

### Render (Backend)
1. Go to your service settings in Render
2. Navigate to the "Custom Domain" section
3. Add your custom domain (e.g., `api.yourdomain.com`)
4. Follow Render's DNS configuration instructions

## Troubleshooting

### Common Backend Issues
- **CORS Errors**: Ensure the `CORS_ORIGIN` on the backend matches exactly with your frontend URL
- **MongoDB Connection Issues**: Verify your connection string and network access settings in MongoDB Atlas
- **Environment Variables**: Make sure all required environment variables are set correctly

### Common Frontend Issues
- **API Connection Errors**: Verify the `VITE_API_URL` is correct and the backend is running
- **Build Failures**: Check the build logs for specific errors
- **Routing Issues**: Ensure the Vercel configuration correctly handles React Router paths

## Monitoring and Maintenance

- Set up uptime monitoring for both frontend and backend
- Regularly check logs in both Vercel and Render dashboards
- Monitor your MongoDB Atlas metrics for database performance 