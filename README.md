# MediHealth Clinical Information System

## Assignment
IT4020 Modern Topics in IT
Assignment 2 (Microservices Architecture)
Year 4 Semester 2

## Project Executive Summary
The MediHealth Clinical Portal is a comprehensive medical management system built using a Microservices Architecture. The system provides a scalable and secure platform for managing patient records, medical appointments, clinical staff, and electronic prescriptions. It enforces role-based access control for three distinct user types: Administrator, Doctor, and Patient.

---

## System Architecture

The solution uses the MERN stack (MongoDB, Express, React, Node.js) with a distributed microservices pattern. All frontend requests pass through a single API Gateway.

| Service              | Port | Responsibility                                                   |
|----------------------|------|------------------------------------------------------------------|
| API Gateway          | 5000 | Central router — forwards all requests to the correct service    |
| Patient Service      | 5001 | Patient identity and profile management                          |
| Doctor Service       | 5002 | Clinical staff profiles, specialization, availability            |
| Appointment Service  | 5003 | Scheduling, booking, and status management                       |
| Prescription Service | 5004 | Electronic prescriptions, PDF generation, notifications          |
| Frontend (React)     | 5173 | Unified UI for all roles                                         |

---

## Project Component Directory

| Folder                  | Description                                                                          |
|-------------------------|--------------------------------------------------------------------------------------|
| `api-gateway/`          | Central routing logic that directs frontend traffic to the correct microservice.     |
| `patient-service/`      | Backend logic and database models for patient identity and profile management.       |
| `doctor-service/`       | Backend logic for managing medical staff profiles and clinical specializations.      |
| `appointment-service/`  | Orchestration logic for scheduling and managing clinical appointments.               |
| `prescription-service/` | Clinical record management, electronic prescriptions, and PDF generation.            |
| `frontend/`             | Unified React application providing the user interface for all system roles.         |

---

## Individual Group Contributions and CRUD Operations

### 1. Mithussh Pushparagavan (Lead)
**Domain:** Patient Management Microservice + API Gateway

| CRUD Operation | Performed By | Location in UI                                         |
|----------------|--------------|--------------------------------------------------------|
| **Create**     | Admin        | Patient Records page → "Register New Patient" form     |
| **Read**       | Admin, Doctor| Patient Records page → searchable & filterable table   |
| **Update**     | Admin        | Patient Records page → Edit (✏️) icon in the table     |
| **Delete**     | Admin        | Patient Records page → Delete (🗑️) icon → Popup       |

- **Backend Routes:** `patient-service/src/routes/patientRoutes.js`
  - `GET /patients` — List all patients
  - `GET /patients/:id` — Get patient by ID
  - `POST /patients` — Register a new patient
  - `PUT /patients/:id` — Update patient profile
  - `DELETE /patients/:id` — Remove patient record
- **Frontend:** `frontend/src/pages/Patients.jsx`
- **Gateway:** `api-gateway/server.js` — Unified service routing

---

### 2. Kajanthan Kirubakaran
**Domain:** Clinical Staff (Doctor) Microservice + Role-Based Authorization

| CRUD Operation | Performed By | Location in UI                                              |
|----------------|--------------|-------------------------------------------------------------|
| **Create**     | Doctor       | Signup page — self-registration                             |
| **Read**       | Admin        | Doctor Records page + Doctor Login Approval page            |
| **Update**     | Admin        | Doctor Login Approval page → Approve/Revoke/Reset buttons   |
| **Delete**     | Admin        | Doctor Login Approval page → Delete (🗑️) icon → Popup      |

- **Backend Routes:** `doctor-service/src/routes/doctorRoutes.js`
  - `GET /doctors` — List all doctors
  - `GET /doctors/:id` — Get doctor by ID
  - `POST /doctors` — Register a new doctor
  - `PUT /doctors/:id` — Update doctor profile
  - `PUT /doctors/:id/approve` — Toggle approval status
  - `PUT /doctors/:id/reset-password` — Reset password to default
  - `PUT /doctors/:id/availability` — Toggle availability
  - `DELETE /doctors/:id` — Remove staff record
- **Frontend:** `frontend/src/pages/Doctors.jsx` and `frontend/src/pages/UserManagement.jsx`

---

### 3. Ashwin Visvanathan
**Domain:** Appointment Orchestration Microservice

| CRUD Operation | Performed By | Location in UI                                              |
|----------------|--------------|-------------------------------------------------------------|
| **Create**     | Patient      | Appointment Records page → "Book Appointment" form          |
| **Read**       | All roles    | Appointment Records page — filtered view by user role       |
| **Update**     | Doctor       | Appointment Records page → Accept / Reject buttons          |
| **Delete**     | Admin        | Appointment Records page → Cancel action                    |

- **Backend Routes:** `appointment-service/src/routes/appointmentRoutes.js`
  - `GET /appointments` — List all appointments
  - `POST /appointments` — Book a new appointment
  - `PUT /appointments/:id/status` — Accept or reject appointment
  - `DELETE /appointments/:id` — Cancel appointment
- **Frontend:** `frontend/src/pages/Appointments.jsx`

---

### 4. Kanzurrizk Rihan
**Domain:** Clinical Documentation (Prescription) Microservice

| CRUD Operation | Performed By      | Location in UI                                              |
|----------------|-------------------|-------------------------------------------------------------|
| **Create**     | Doctor / Admin    | Prescription Records page → "Issue Prescription" form       |
| **Read**       | All roles         | Prescription Records page — Patient sees own records only   |
| **Update**     | Doctor / Admin    | Prescription Records page → Edit button                     |
| **Delete**     | Doctor / Admin    | Prescription Records page → Delete button → Popup           |

- **Backend Routes:** `prescription-service/src/routes/prescriptionRoutes.js`
  - `GET /prescriptions` — List all prescriptions
  - `GET /prescriptions/:id` — Get by ID
  - `GET /prescriptions/patient/:patientId` — Get by patient
  - `POST /prescriptions` — Create prescription
  - `PUT /prescriptions/:id` — Update prescription
  - `PUT /prescriptions/:id/status` — Mark as Seen/New
  - `DELETE /prescriptions/:id` — Delete prescription
- **Frontend:** `frontend/src/pages/Prescriptions.jsx`

---

## Demo Credentials

| Role          | Email              | Password       |
|---------------|--------------------|----------------|
| Administrator | admin@medhealth.co | adMin#$92%gov  |
| Doctor        | doc@med.com        | doc@123        |
| Patient       | pat@med.com        | pat@1234       |

---

## API Documentation (Swagger)

Each microservice is documented using the Swagger OpenAPI Specification.

| Service      | URL                                          |
|--------------|----------------------------------------------|
| Patient API  | http://localhost:5001/patients/api-docs      |
| Doctor API   | http://localhost:5002/doctors/api-docs       |
| Appointment  | http://localhost:5003/appointments/api-docs  |
| Prescription | http://localhost:5004/prescriptions/api-docs |

All endpoints are also accessible through the unified Gateway at port `5000`.

---

## System Execution Guide

> **Important:** Always run commands from the root `MediHealth/` folder only. Never run commands inside a subfolder.

### Step 1: Prerequisites
- Install **Node.js** from nodejs.org
- Ensure **MongoDB** is installed and running locally on port `27017`

### Step 2: Install All Dependencies (One-time only)
```bash
npm run install:all
```
Wait for all packages to finish installing before proceeding.

### Step 3: Launch the Platform
```bash
npm start
```
Wait until you see `Connected to MongoDB` and `Service is running` messages for all 5 services.

### Step 4: Access the Portal
Open your browser and navigate to: **http://localhost:5173**

Use the Demo Credentials above to log in.

### Troubleshooting

| Issue | Fix |
|---|---|
| `npm is not recognized` | Install Node.js from nodejs.org |
| `Connection error` | Ensure MongoDB is open and running |
| `Command failed` | Ensure you are in the root `MediHealth/` folder |
| `404 on API calls` | Ensure all 6 services started successfully |

---

## Compliance and Standards
This project adheres to the IT4020 module requirements. All external libraries are documented within the respective `package.json` files inside each service directory.
