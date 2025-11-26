#  CampusNet: Professional Networking Platform for Delhi University

CampusNet is a dedicated professional networking platform — a **“LinkedIn for DU”** — designed exclusively for the **Delhi University community** including students, alumni, and faculty.  
Its primary goal is to help users grow professionally, build academic and career connections, and provide a centralized digital hub for the DU network.

This repository contains the full source code for the **MERN-based** full-stack application:  
-  A RESTful API backend  
-  A modern React + Vite frontend (SPA)

---

##  Key Features

CampusNet includes the following major functionalities:

### Authentication
- Signup and Login
- JWT-based secured sessions
- Password hashing using bcrypt

### User Profiles
- Editable user details: bio, headline, skills, etc.
- Profile photo support
- View other users' public profiles

### Dynamic Activity Feed
- Personalized feed with posts from the user’s network
- Create text-based posts
- View feed in chronological order

### Social Interaction
- Like/Unlike posts  
- Add comments (modal-based UI)
- “Time ago” formatting for posts & comments

---

## Technology Stack (MERN)

| Component | Technology | Role |
|----------|------------|------|
| **Frontend** | React (Vite) | UI, routing, components |
| **Styling** | Tailwind CSS | Responsive utility-first design |
| **Backend API** | Node.js + Express.js | All server-side logic |
| **Database** | MongoDB + Mongoose | Storage for users, posts, comments |
| **Security** | JWT & bcrypt | Tokens + password hashing |

---

## Getting Started

### Prerequisites
You must have:

- **Node.js v18+**
- **npm or yarn**
- **Git**
- **MongoDB** (Local or Atlas)

---

## Installation

### Clone the Repository
```bash
git clone https://github.com/abhi-navz/campusNet.git
cd campusNet
```

---

### Install Dependencies — Backend
#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

---

## Configure Environment Variables
### Create a .env file inside backend/:
```bash
PORT=5000
MONGO_URI="mongodb+srv://user:<password>@clustername/campusnetdb?retryWrites=true&w=majority"
JWT_SECRET="your_very_secure_jwt_secret"
```

---

## Run the Application (Development Mode)
### Terminal 1 — Start Backend Server
```bash
cd backend
npm run start
```
Server will run at: http://localhost:5000

---

### Terminal 2 — Start Frontend (Vite)
```bash
cd frontend
npm run dev
```
Frontend will run at: http://localhost:5173

---


## Project File Structure

##### Backend Directory — backend/
```bash
backend/
│
├── config/
│   └── db.js               # MongoDB connection
│
├── controllers/
│   ├── auth/               # Signup/Login logic
│   ├── user/               # Profile: view/update
│   └── postController.js   # Posts, feed, likes, comments
│
├── middleware/
│   └── auth.js             # JWT authentication middleware
│
├── models/
│   ├── User.js             # User schema
│   └── Post.js             # Post schema
│
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   └── postRoutes.js
│
└── server.js               # App entry point
```



##### Frontend Directory — frontend/src/
```bash
src/
│
├── components/             # Navbar, CreatePost, CommentModal, Layout
├── pages/                  # Home, UserProfile, Login, Register, EditProfile
│
├── routes/
│   └── AppRoutes.jsx       # Protected/Unprotected routes
│
├── utils/
│   └── timeAgo.js          # Time formatting helper
│
└── App.jsx                 # Root component
```


## Core API Endpoints:
#### Auth
**Method** |	**Endpoint** |	**Description**
|--------|------------|----------|
POST |	```/api/auth/signup```	|Register a new user
POST |	```/api/auth/login```	|Authenticate and receive JWT

#### Posts

**Method** |	**Endpoint** |	**Description**
|--------|------------|----------|
GET	| ```/api/post/feed```	| Get chronological feed (Protected)
PUT	| ```/api/post/like/:postId```	| Toggle like on a post (Protected)

#### User

**Method** |	**Endpoint** |	**Description**
|--------|------------|----------|
GET |	```/api/user/:id```	| Get public user profile
PUT	| ```/api/user/update/:id```	| Update profile (Protected)

---

## Contributers
Shivashish Yadav: https://github.com/shivashishyadav
Abhinav Gupta: https://github.com/abhi-navz
Ajay Muleva: "Pending.."

Project Link: https://github.com/abhi-navz/campusNet.git
