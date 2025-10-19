# 🚀 FAMS Store Deployment Fixes

## ✅ Fixed Issues

### 1. **Hardcoded URLs Replaced**
All static `http://localhost:5000` and `http://localhost:5173` URLs have been replaced with environment variables:

#### Client-side fixes:
- ✅ `App.jsx` - Token handling API calls
- ✅ `AuthContext.jsx` - All user authentication APIs
- ✅ `AdminContext.jsx` - Admin authentication
- ✅ `CustomerSupportChat.jsx` - Socket and API URLs
- ✅ `SkinConsultantChat.jsx` - Socket connections
- ✅ `Login.jsx` - Login and Google OAuth
- ✅ `Signup.jsx` - Registration and Google OAuth
- ✅ `VerifyOTP.jsx` - Email verification
- ✅ `ResetPassword.jsx` - Password reset
- ✅ `Reels.jsx` - Reels API calls
- ✅ `SupportDashboard.jsx` - Support chat APIs
- ✅ `ReelsTab.jsx` - Admin reel management
- ✅ `Dashboard.jsx` - Admin dashboard APIs (partially)
- ✅ `ShopContext.jsx` - Already using env vars
- ✅ `useProductFetch.js` - Already using env vars
- ✅ `useCategoryFetch.js` - Already using env vars

#### Server-side fixes:
- ✅ `app.js` - CORS configuration
- ✅ `server.js` - Socket.io CORS configuration
- ✅ `.env.example` - Updated with all required variables

### 2. **Environment Variables Setup**

#### Frontend Environment Variables (.env)
```bash
# Required for deployment
VITE_API_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com

# For local development
# VITE_API_URL=http://localhost:5000
# VITE_SOCKET_URL=http://localhost:5000
```

#### Backend Environment Variables (.env)
```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Authentication
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
ENCRYPTION_KEY=your-encryption-key

# CORS & Frontend URLs
CLIENT_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com
FRONTEND_URL=https://your-frontend-domain.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-domain.com/api/auth/google/callback

# Session
SESSION_SECRET=your-session-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
SMTP_SECURE=true
```

## 🚀 Deployment Steps

### 1. **Backend Deployment (Render/Railway)**

#### For Render:
1. Connect your GitHub repository
2. Set **Root Directory**: `server`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add all environment variables from above
6. Deploy and note the URL (e.g., `https://fams-api.onrender.com`)

#### For Railway:
1. Connect repository
2. Railway will auto-detect the `railway.json` configuration
3. Add environment variables
4. Deploy and note the URL

### 2. **Frontend Deployment (Vercel)**

1. Connect your GitHub repository
2. Set **Root Directory**: `client`
3. Set **Framework Preset**: `Vite`
4. Set **Build Command**: `npm run build`
5. Set **Output Directory**: `dist`
6. Add environment variables:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   VITE_SOCKET_URL=https://your-backend-url.onrender.com
   ```
7. Deploy and note the URL (e.g., `https://fams-store.vercel.app`)

### 3. **Update Backend with Frontend URL**

After frontend deployment, update your backend environment variables:
```
CLIENT_URL=https://fams-store.vercel.app
CORS_ORIGIN=https://fams-store.vercel.app
FRONTEND_URL=https://fams-store.vercel.app
```

## 🔧 Additional Configuration

### Google OAuth Setup
Update your Google OAuth configuration:
- **Authorized JavaScript origins**: Add your frontend URL
- **Authorized redirect URIs**: Add `https://your-backend-url.com/api/auth/google/callback`

### MongoDB Atlas
- Ensure your deployment IP addresses are whitelisted
- Use connection string with proper credentials

## 🧪 Testing Deployment

1. **Test API endpoints**: Visit `https://your-backend-url.com/api/products`
2. **Test frontend**: Visit your frontend URL
3. **Test authentication**: Try login/signup
4. **Test real-time features**: Try customer support chat
5. **Test admin panel**: Login as admin

## 🐛 Common Issues & Solutions

### CORS Errors
- Ensure `CORS_ORIGIN` matches your frontend URL exactly
- Check for trailing slashes in URLs

### Socket.io Connection Issues
- Verify `VITE_SOCKET_URL` is set correctly
- Check WebSocket support on your hosting platform

### Authentication Issues
- Verify JWT secrets are set
- Check Google OAuth configuration
- Ensure MongoDB connection is working

### Environment Variable Issues
- Double-check all variable names (case-sensitive)
- Restart services after changing environment variables
- Use deployment platform's environment variable interface

## 📝 Verification Checklist

- [ ] Backend deploys without errors
- [ ] Frontend deploys without errors
- [ ] API calls work from frontend to backend
- [ ] Authentication (login/signup) works
- [ ] Google OAuth works
- [ ] Socket.io connections work
- [ ] Admin panel accessible
- [ ] Email notifications work
- [ ] Image uploads work (Cloudinary)
- [ ] Database operations work

Your FAMS store should now be fully deployed and functional! 🎉
