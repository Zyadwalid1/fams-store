# 🌸 FAMS - Fashion and Makeup Store

<div align="center">

![FAMS Logo](https://img.shields.io/badge/FAMS-Beauty%20%26%20Cosmetics-ff69b4?style=for-the-badge&logo=shopify&logoColor=white)

**A Modern Full-Stack E-Commerce Platform for Beauty & Cosmetics**

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Tech Stack](#-tech-stack) • [API Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Demo](#-demo)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Developer](#zyad-walid-mohammed-hassan)
- [License](#-license)

---

## 🎯 About

**FAMS** (Fashion and Makeup Store) is a comprehensive e-commerce platform designed specifically for the beauty and cosmetics industry. Built with modern web technologies, it provides a seamless shopping experience with real-time features, personalized recommendations, and expert consultations.

### 🎨 What Makes FAMS Special?

- 🛍️ **Curated Beauty Products** - Premium cosmetics and skincare from trusted brands
- 💬 **Real-Time Chat Support** - Instant customer service via Socket.io
- 🎥 **Product Reels** - TikTok-style video showcases for products
- 👨‍⚕️ **Skin Consultant** - AI-powered skincare recommendations
- 📱 **Mobile-First Design** - Responsive and optimized for all devices
- 🔐 **Secure Authentication** - JWT + Google OAuth integration
- 💳 **Multiple Payment Options** - Cash on Delivery & Online payments

---

## ✨ Features

### 🛒 **E-Commerce Core**
- ✅ Advanced product catalog with categories, brands, and filters
- ✅ Smart search with autocomplete and suggestions
- ✅ Shopping cart with real-time updates
- ✅ Wishlist functionality
- ✅ Product reviews and ratings
- ✅ Related products recommendations
- ✅ Discount and promotion system

### 👤 **User Management**
- ✅ User registration and authentication (Email + Google OAuth)
- ✅ Email verification with OTP
- ✅ Password reset functionality
- ✅ User profile management
- ✅ Order history and tracking
- ✅ Multiple shipping addresses

### 📦 **Order Management**
- ✅ Seamless checkout process
- ✅ Order confirmation emails
- ✅ Order status tracking
- ✅ Egyptian governorate-based shipping
- ✅ Cash on Delivery (COD) support
- ✅ Order history with detailed views

### 💬 **Real-Time Features**
- ✅ Live customer support chat (Socket.io)
- ✅ Skin consultant chat with AI recommendations
- ✅ Real-time notifications
- ✅ Admin support dashboard

### 🎥 **Content Features**
- ✅ Product reels (video showcases)
- ✅ Interactive reel slider on homepage
- ✅ Like and view tracking
- ✅ Product linking in reels

### 🔧 **Admin Panel**
- ✅ Product management (CRUD operations)
- ✅ Category and brand management
- ✅ Order management and tracking
- ✅ User management
- ✅ Reel content management
- ✅ Analytics dashboard
- ✅ Bulk image upload to Cloudinary

### 🎨 **UI/UX Features**
- ✅ Dark mode support
- ✅ Smooth animations with Framer Motion
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Modern glassmorphism effects
- ✅ Loading skeletons
- ✅ Toast notifications
- ✅ Infinite scroll for products

---

## 🎬 Demo

### Live Demo
🌐 **Frontend:** [https://fams-store.vercel.app](https://fams-store.vercel.app)  
🔧 **Backend API:** [https://fams-store-api.onrender.com](https://fams-store-api.onrender.com)

### Test Credentials
```
Admin Account:
Email: admin@fams.com
Password: admin123

User Account:
Email: user@fams.com
Password: user123
```

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Purpose |
|-----------|---------|
| ⚛️ **React 18** | UI Framework |
| ⚡ **Vite** | Build tool & dev server |
| 🎨 **TailwindCSS** | Styling framework |
| 🎭 **Framer Motion** | Animations |
| 🧭 **React Router** | Client-side routing |
| 📡 **Axios** | HTTP client |
| 🔌 **Socket.io Client** | Real-time communication |
| 🍞 **React Hot Toast** | Notifications |
| 🎯 **React Icons** | Icon library |

### **Backend**
| Technology | Purpose |
|-----------|---------|
| 🟢 **Node.js** | Runtime environment |
| 🚂 **Express.js** | Web framework |
| 🍃 **MongoDB** | Database |
| 🔷 **Mongoose** | ODM |
| 🔐 **JWT** | Authentication |
| 🔒 **bcrypt** | Password hashing |
| 📧 **Nodemailer** | Email service |
| ☁️ **Cloudinary** | Image/video storage |
| 🔌 **Socket.io** | WebSocket server |
| 🔑 **Passport.js** | OAuth (Google) |

### **DevOps & Deployment**
| Service | Purpose |
|---------|---------|
| ▲ **Vercel** | Frontend hosting |
| 🚀 **Render** | Backend hosting |
| 🗄️ **MongoDB Atlas** | Database hosting |
| ☁️ **Cloudinary** | Media CDN |

---

## 🏗️ Architecture

```
fams/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   ├── routes/        # Route configuration
│   │   └── App.jsx        # Main app component
│   └── package.json
│
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── utils/         # Utility functions
│   │   └── server.js      # Entry point
│   └── package.json
│
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- Cloudinary account
- SMTP email service (Gmail, SendGrid, etc.)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/zyadwalid1/fams-store.git
cd fams-store
```

### 2️⃣ Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start development server
npm run dev
```

### 3️⃣ Frontend Setup

```bash
# Navigate to client directory (from root)
cd client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your API URL
nano .env

# Start development server
npm run dev
```

### 4️⃣ Access the Application

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **API Docs:** http://localhost:5000/api

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/fams
# OR MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fams

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=noreply@fams.com

# OTP Configuration
OTP_LENGTH=6
OTP_DIGIT_ONLY=true
OTP_ALPHABET=0123456789

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL (for CORS and redirects)
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Session Secret
SESSION_SECRET=your_session_secret_key
```

### Frontend (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 📚 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://fams-store-api.onrender.com/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "mobile": "01234567890"
}
```

#### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Verify Email
```http
POST /api/users/verify-email
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

### Product Endpoints

#### Get All Products
```http
GET /api/products?page=1&limit=16&category=categoryId&brand=brandId&sort=newest
```

#### Get Product by ID
```http
GET /api/products/:id
```

#### Create Product (Admin)
```http
POST /api/products
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 299.99,
  "category": "categoryId",
  "brand": "brandId",
  "images": ["url1", "url2"],
  "stock": 100
}
```

### Order Endpoints

#### Create Order
```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderItems": [...],
  "shippingAddress": {...},
  "paymentMethod": "COD",
  "itemsTotal": 500,
  "shippingFee": 50,
  "totalAmount": 550
}
```

#### Get User Orders
```http
GET /api/orders
Authorization: Bearer {token}
```

### Cart Endpoints

#### Get Cart
```http
GET /api/cart
Authorization: Bearer {token}
```

#### Add to Cart
```http
POST /api/cart
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "productId",
  "quantity": 1
}
```

### Reels Endpoints

#### Get All Reels
```http
GET /api/reels?page=1&limit=10
```

#### Like Reel
```http
POST /api/reels/like/:id
Authorization: Bearer {token}
```



## 🌐 Deployment

### Frontend (Vercel)

1. **Push to GitHub**
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

2. **Deploy on Vercel**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Set root directory to `client`
   - Add environment variables:
     - `VITE_API_URL`: Your backend URL
     - `VITE_SOCKET_URL`: Your backend URL
   - Deploy

### Backend (Render)

1. **Create Render Account**
   - Go to [Render](https://render.com)
   - Create new Web Service

2. **Configure Service**
   - Connect GitHub repository
   - Set root directory to `server`
   - Build command: `npm install`
   - Start command: `npm start`
   - Add all environment variables from `.env`

3. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment

### Database (MongoDB Atlas)

1. **Create Cluster**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create free cluster

2. **Configure**
   - Add database user
   - Whitelist IP (0.0.0.0/0 for all)
   - Get connection string
   - Update `MONGODB_URI` in backend env

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Code Style Guidelines
- Use ESLint and Prettier
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation

---

## 👨‍💻 Developer

<div align="center">

### **Zyad Walid Mohammed Hassan**

**Full-Stack Developer & System Architect**

[![GitHub](https://img.shields.io/badge/GitHub-zyadwalid1-181717?style=for-the-badge&logo=github)](https://github.com/zyadwalid1)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Zyad_Walid-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/zyad-walid)
[![Email](https://img.shields.io/badge/Email-zyad.walid.dev@gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:zyad.walid.dev@gmail.com)
[![Phone](https://img.shields.io/badge/Phone-+20_100_923_3046-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](tel:+201009233046)

**Passionate full-stack developer who single-handedly designed and built the entire FAMS e-commerce platform.**

*From concept to deployment, every line of code, every user interface element, and every system architecture decision was crafted with precision and innovation.*

### 🛠️ Technologies Used
`React` • `Node.js` • `MongoDB` • `Express` • `Socket.io` • `TailwindCSS` • `Vite` • `Cloudinary`

</div>

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Groovy Clinics** - Partnership for skincare expertise
- **FAMS Team** - Farah Mohammed, Alia Hesham, Mariem & Malak Ahmed, Sief Tamer
- **Open Source Community** - For amazing tools and libraries

---

## 📞 Support

For support, email **zyad.walid.dev@gmail.com** or create an issue in this repository.

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

**Made with ❤️ by Zyad Walid Mohammed Hassan**

![Visitors](https://visitor-badge.laobi.icu/badge?page_id=zyadwalid1.fams-store)
![GitHub Stars](https://img.shields.io/github/stars/zyadwalid1/fams-store?style=social)
![GitHub Forks](https://img.shields.io/github/forks/zyadwalid1/fams-store?style=social)

</div>
