# Blog Platform

A full-stack blog platform built with Spring Boot and React.

## Tech Stack

- Backend: Spring Boot, Spring Security, Spring Data JPA, JWT, OAuth2
- Frontend: React, Vite, React Router, Axios
- Database: MySQL
- Authentication: Email/password login and Google OAuth

## Features

- User registration and login
- Google sign-in
- JWT-based authentication
- Create, edit, publish, draft, and delete posts
- Comment system
- Profile management
- Admin panel for managing users
- Image upload support

## Project Structure

```text
Blog_platform/
├── src/                    # Spring Boot backend
├── frontend/               # React frontend
├── pom.xml                 # Maven config
├── mvnw.cmd                # Maven wrapper for Windows
└── README.md
```

## Prerequisites

- Java 21
- Node.js and npm
- MySQL

## Environment Variables

Set these before running the backend:

```properties
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_base64_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Backend Configuration

The backend reads values from:

- [application.properties](/C:/Users/asus/OneDrive/Desktop/Spring/Blog_platform/Blog_platform/src/main/resources/application.properties)

Default backend settings include:

- MySQL database: `blog_db`
- Backend port: `8080`
- Frontend URL: `http://localhost:5173`

## Run Backend

From the project root:

```powershell
.\mvnw.cmd spring-boot:run
```

## Run Frontend

From the `frontend` folder:

```powershell
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Admin Access

- The first registered user becomes `ROLE_ADMIN`
- Admin users can:
  - enable/disable users
  - promote/demote users
  - delete users

## API Notes

- Protected endpoints use:

```text
Authorization: Bearer <jwt-token>
```

- Google login creates a JWT using your internal app user id

## Git Setup

Initialize git:

```powershell
git init
git add .
git commit -m "Initial commit"
```

Connect to GitHub:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## Important

Do not commit secrets such as:

- database passwords
- JWT secrets
- Google OAuth client secrets

Make sure local secret files are ignored before pushing the repo publicly.
