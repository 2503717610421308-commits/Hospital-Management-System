# Hospital Management System

A comprehensive full-stack Hospital Management System built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

### Role-Based Access Control
- **Admin** — Full system management (patients, doctors, nurses, departments, medicines, billing, reports)
- **Doctor** — Appointments, consultations, medical records, prescriptions
- **Nurse** — Patient vitals, assigned patients, nursing notes
- **Receptionist** — Patient registration, appointment scheduling, billing
- **Patient** — Book appointments, view records, prescriptions, bills & payments

### Core Modules
- Patient Registration & Profile Management
- Doctor & Staff Management
- Department Management
- Appointment Scheduling with Token System
- Medical Records & Diagnosis
- Prescription Management with Refill Requests
- Billing & Payment Processing (Simulated)
- Notification System
- Reports & Analytics Dashboard
- Print-ready Bill Generation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Bootstrap 5, Bootstrap Icons, React Router 6, Axios |
| Backend | Node.js, Express.js, JWT Auth, bcryptjs, Helmet, CORS, Rate Limiting |
| Database | MongoDB, Mongoose ODM |

## Prerequisites

- **Node.js** v18+
- **MongoDB** (local or Atlas cloud)
- **npm** v9+

## Installation & Setup

### 1. Clone the repository
```bash
git clone <repo-url>
cd hospital-management-system
```

### 2. Install dependencies
```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 3. Configure environment
Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hospital_management
JWT_SECRET=your_secret_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 4. Seed the database
```bash
cd server
node seed/seedData.js
```

### 5. Start the application
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

Open **http://localhost:5173** in your browser.

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hospital.com | Admin@123 |
| Doctor | doctor@hospital.com | Doctor@123 |
| Nurse | nurse@hospital.com | Nurse@123 |
| Receptionist | receptionist@hospital.com | Receptionist@123 |
| Patient | patient@hospital.com | Patient@123 |

## Project Structure

```
hospital-management-system/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # Auth context
│   │   ├── hooks/             # Custom hooks
│   │   ├── layouts/           # Dashboard layout
│   │   ├── pages/             # Role-based pages
│   │   │   ├── admin/
│   │   │   ├── doctor/
│   │   │   ├── nurse/
│   │   │   ├── patient/
│   │   │   └── receptionist/
│   │   └── services/          # API service layer
│   └── vite.config.js
├── server/                    # Express backend
│   ├── config/                # DB connection
│   ├── controllers/           # Route handlers
│   ├── middleware/             # Auth, role, error
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API routes
│   ├── seed/                  # Database seeder
│   └── utils/                 # Helpers
└── README.md
```

## API Endpoints

| Module | Endpoint | Methods |
|--------|----------|---------|
| Auth | `/api/auth` | POST login, register; GET me |
| Patients | `/api/patients` | GET, POST, PUT, DELETE |
| Doctors | `/api/doctors` | GET, POST, PUT, DELETE |
| Nurses | `/api/nurses` | GET, POST, PUT, DELETE |
| Departments | `/api/departments` | GET, POST, PUT, DELETE |
| Appointments | `/api/appointments` | GET, POST, PUT, PATCH, DELETE |
| Medical Records | `/api/medical-records` | GET, POST, PUT |
| Prescriptions | `/api/prescriptions` | GET, POST, PUT, PATCH |
| Medicines | `/api/medicines` | GET, POST, PUT, DELETE |
| Treatments | `/api/treatments` | GET, POST, PUT |
| Bills | `/api/bills` | GET, POST, PUT |
| Payments | `/api/payments` | GET, POST |
| Reports | `/api/reports` | GET dashboard, appointments, revenue, patients |
| Notifications | `/api/notifications` | GET, PATCH, DELETE |

## License

ISC
