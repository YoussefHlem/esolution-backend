# EsolutionPT Backend API

## Project Overview
Backend API for EsolutionPT, providing comprehensive endpoints for Projects, Downloads, Equipments, and News management.

## Features
- Authentication with Admin and User roles
- CRUD operations for Projects, Downloads, Equipments, and News
- File upload support for images and PDFs
- Secure routes with JWT authentication

## Prerequisites
- Node.js (v14+)
- MongoDB
- npm

## Installation
1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/esolution
JWT_SECRET=your_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin_password
URL=
```

## Running the Server
- Development mode: `npm run dev`
- Production mode: `npm start`

## API Endpoints

### Authentication
- `POST /api/auth/login`: Login for Admin and Users
- `POST /api/auth/register`: Register new users

### Projects
- `GET /api/projects`: Get all projects
- `POST /api/projects`: Create project (Admin only)
- `PUT /api/projects/:id`: Update project (Admin only)
- `DELETE /api/projects/:id`: Delete project (Admin only)

### Downloads
- `GET /api/downloads`: Get all downloads
- `POST /api/downloads`: Create download (Admin only)
- `PUT /api/downloads/:id`: Update download (Admin only)
- `DELETE /api/downloads/:id`: Delete download (Admin only)

### Equipments
- `GET /api/equipments`: Get all equipments
- `POST /api/equipments`: Create equipment (Admin only)
- `PUT /api/equipments/:id`: Update equipment (Admin only)
- `DELETE /api/equipments/:id`: Delete equipment (Admin only)

### News
- `GET /api/news`: Get all news
- `GET /api/news/latest`: Get latest news
- `GET /api/news/:id`: Get single news item
- `POST /api/news`: Create news (Admin only)
- `PUT /api/news/:id`: Update news (Admin only)
- `DELETE /api/news/:id`: Delete news (Admin only)

## Authentication
- Admin login uses predefined credentials in `.env`
- Regular users can register and login
- JWT token required for protected routes

## File Uploads
- Images for Projects, Equipments
- PDFs for Downloads
- Uploaded files stored in `uploads/` directory

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT License
