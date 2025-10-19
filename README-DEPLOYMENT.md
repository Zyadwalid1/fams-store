# FAMS Store Deployment Guide

This comprehensive guide provides step-by-step instructions for deploying the FAMS Store application to production environments with all necessary environment variable configurations.

## Overview

FAMS Store is a full-stack e-commerce application with:
- **Frontend**: React + Vite (deployed on Vercel)
- **Backend**: Node.js + Express (deployed on Render/Railway)
- **Database**: MongoDB Atlas
- **Real-time**: Socket.io for chat features
- **Authentication**: JWT + Google OAuth
- **File Storage**: Cloudinary

## Prerequisites

- [Render](https://render.com) or [Railway](https://railway.app) account for backend
- [Vercel](https://vercel.com) account for frontend
- [MongoDB Atlas](https://www.mongodb.com/atlas) account with cluster
- [Cloudinary](https://cloudinary.com) account for image storage
- [Google Cloud Console](https://console.cloud.google.com) for OAuth (optional)
- Your GitHub repository connected to deployment platforms

## Environment Variables Setup

### Backend Environment Variables

Create these environment variables in your backend deployment platform:

```bash
# Server Configuration
NODE_ENV=production
PORT=10000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fams-store?retryWrites=true&w=majority

# Authentication & Security
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
ENCRYPTION_KEY=your-encryption-key-32-chars
SALT_ROUNDS=10

# Frontend URLs (Update after frontend deployment)
CLIENT_URL=https://your-frontend-domain.vercel.app
CORS_ORIGIN=https://your-frontend-domain.vercel.app
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-domain.onrender.com/api/auth/google/callback

# Session Configuration
SESSION_SECRET=your-session-secret-key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
SMTP_SECURE=true

# OTP Configuration
OTP_EXPIRATION_TIME=600
OTP_LENGTH=6
OTP_ALPHABET=0123456789
OTP_DIGIT_ONLY=true

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend Environment Variables

```bash
# API Configuration
VITE_API_URL=https://your-backend-domain.onrender.com
VITE_SOCKET_URL=https://your-backend-domain.onrender.com
```

## Backend Deployment (Render)

### Step 1: Login to Render
- Go to [dashboard.render.com](https://dashboard.render.com) and sign in

### Step 2: Create a New Web Service
- Click "New +" and select "Web Service"
- Connect your GitHub repository
- Select the repository containing the FAMS Store application

### Step 3: Configure the Web Service
- **Name**: `fams-store-api` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose the region closest to your users
- **Branch**: `main` (or your main branch)
- **Root Directory**: `server` 
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free (or select a paid plan for production use)

### Step 4: Add Environment Variables
Add all the backend environment variables listed above. **Critical variables**:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Generate a secure 32+ character string
- `ENCRYPTION_KEY`: Generate a secure 32+ character string
- `CLOUDINARY_*`: Your Cloudinary credentials

### Step 5: Deploy the Service
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- **Save the deployed URL** (e.g., `https://fams-store-api.onrender.com`)

## Alternative: Backend Deployment (Railway)

### Using Railway (Alternative to Render)
1. Connect your GitHub repository to Railway
2. Railway auto-detects the `railway.json` configuration
3. Add the same environment variables as above
4. Deploy and note the URL

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

## 🔄 Post-Deployment Configuration

### 1. Update Backend with Frontend URL
After frontend deployment, update your backend environment variables:
```bash
CLIENT_URL=https://your-actual-frontend-url.vercel.app
CORS_ORIGIN=https://your-actual-frontend-url.vercel.app
FRONTEND_URL=https://your-actual-frontend-url.vercel.app
```

### 2. Google OAuth Configuration (If Used)
Update your Google Cloud Console OAuth settings:
- **Authorized JavaScript origins**: Add your frontend URL
- **Authorized redirect URIs**: Add your backend callback URL

### 3. MongoDB Atlas Network Access
- Add your deployment platform IP addresses to the allowlist
- For Render: Add `0.0.0.0/0` (all IPs) or specific Render IP ranges

## 🧪 Testing Your Deployment

### Backend Testing
1. Visit `https://your-backend-url.onrender.com/api/products` to test API
2. Check logs in Render dashboard for any errors
3. Test database connection by creating a test user

### Frontend Testing
1. Visit your frontend URL
2. Test user registration and login
3. Test product browsing and cart functionality
4. Test real-time chat features
5. Test admin panel access (if applicable)

### Integration Testing
- [ ] User authentication works end-to-end
- [ ] API calls from frontend to backend succeed
- [ ] Socket.io connections establish properly
- [ ] Image uploads work (Cloudinary integration)
- [ ] Email notifications send correctly
- [ ] Google OAuth flow works (if configured)

## 🐛 Troubleshooting

### Common Backend Issues

**CORS Errors**
```
Access to fetch at 'https://backend.com/api/...' from origin 'https://frontend.com' has been blocked by CORS policy
```
- **Solution**: Ensure `CORS_ORIGIN` exactly matches your frontend URL (no trailing slash)
- **Check**: Both `CLIENT_URL` and `CORS_ORIGIN` are set correctly

**MongoDB Connection Issues**
```
MongoNetworkError: failed to connect to server
```
- **Solution**: Verify connection string format and credentials
- **Check**: Network access settings in MongoDB Atlas
- **Fix**: Ensure IP addresses are whitelisted

**Environment Variable Issues**
```
JWT_SECRET is not defined
```
- **Solution**: Double-check all environment variables are set
- **Check**: Variable names are exactly as specified (case-sensitive)
- **Fix**: Restart the service after adding variables

**Socket.io Connection Issues**
```
WebSocket connection failed
```
- **Solution**: Verify `VITE_SOCKET_URL` matches backend URL
- **Check**: Render supports WebSocket connections
- **Fix**: Ensure CORS is properly configured for Socket.io

### Common Frontend Issues

**API Connection Errors**
```
Failed to fetch
```
- **Solution**: Verify `VITE_API_URL` is correct and backend is running
- **Check**: Backend health at `/api/products` endpoint
- **Fix**: Ensure no trailing slashes in API URL

**Build Failures**
```
Build failed with exit code 1
```
- **Solution**: Check build logs for specific errors
- **Common Fix**: Ensure all dependencies are in `package.json`
- **Check**: Node.js version compatibility

**Routing Issues (404 on refresh)**
- **Solution**: Add `vercel.json` configuration for SPA routing
- **Fix**: Ensure React Router is properly configured

### Environment-Specific Issues

**Development vs Production**
- **Issue**: App works locally but fails in production
- **Solution**: Check environment variable differences
- **Fix**: Ensure production URLs are used in production environment

**Mixed Content Errors**
- **Issue**: HTTP requests from HTTPS frontend
- **Solution**: Ensure all API URLs use HTTPS in production
- **Fix**: Update `VITE_API_URL` to use `https://`

## 📊 Monitoring and Maintenance

### Performance Monitoring
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor response times and error rates
- Set up alerts for service downtime

### Log Monitoring
- **Render**: Check service logs regularly
- **Vercel**: Monitor function logs and build logs
- **MongoDB Atlas**: Monitor database performance metrics

### Security Maintenance
- Regularly update dependencies (`npm audit`)
- Monitor for security vulnerabilities
- Rotate JWT secrets and API keys periodically
- Review and update CORS origins as needed

### Backup Strategy
- **Database**: Set up automated MongoDB Atlas backups
- **Code**: Ensure GitHub repository is properly backed up
- **Environment Variables**: Keep secure backup of all environment configurations

## 🚀 Scaling Considerations

### Backend Scaling
- **Render**: Upgrade to paid plans for better performance
- **Database**: Consider MongoDB Atlas cluster scaling
- **CDN**: Use Cloudinary's CDN for image delivery

### Frontend Scaling
- **Vercel**: Automatic scaling included
- **Performance**: Implement code splitting and lazy loading
- **Caching**: Configure proper cache headers

## 📞 Support Resources

### Platform Documentation
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

### Common Commands
```bash
# Check deployment logs
render logs --service your-service-name

# Redeploy service
render deploy --service your-service-name

# Check Vercel deployment
vercel logs your-deployment-url
```

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] All hardcoded URLs replaced with environment variables
- [ ] MongoDB Atlas cluster created and configured
- [ ] Cloudinary account set up
- [ ] Google OAuth configured (if used)
- [ ] All environment variables documented

### Backend Deployment
- [ ] Render/Railway service created
- [ ] Root directory set to `server`
- [ ] All environment variables added
- [ ] Service deployed successfully
- [ ] API endpoints responding correctly

### Frontend Deployment
- [ ] Vercel project created
- [ ] Root directory set to `client`
- [ ] Environment variables configured
- [ ] Build completed successfully
- [ ] Frontend accessible and functional

### Post-Deployment
- [ ] Backend CORS updated with frontend URL
- [ ] End-to-end functionality tested
- [ ] Google OAuth tested (if configured)
- [ ] Real-time features tested
- [ ] Admin panel tested
- [ ] Monitoring set up

🎉 **Congratulations! Your FAMS Store is now live and ready for users!** 