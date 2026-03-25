# MediHealth Clinical Information System

## Assignment
IT4020 Modern Topics in IT ~ Assignment 2  (Microservices Architecture) ~Year 4 Semester 2

## Project Executive Summary
The MediHealth Clinical Portal is a comprehensive medical management system built using a Microservices Architecture. The purpose of this system is to provide a robust and scalable platform for managing patient records, medical appointments, clinical staff availability, and electronic prescriptions. The system ensures high data integrity, professional documentation output, and role based access control for administrators, doctors, and patients.

## Project Component Directory
To ensure absolute clarity during the evaluation process, the project is organized into the following specialized directories:

1. api gateway: This folder contains the central routing logic that directs traffic from the frontend to the correct microservice.
2. patient service: This folder contains the backend logic and database models for patient identity and profile management.
3. doctor service: This folder contains the backend logic for managing medical staff profiles and clinical specializations.
4. appointment service: This folder contains the orchestration logic for scheduling and managing clinical appointments.
5. prescription service: This folder contains the clinical record management system and professional PDF generation logic.
6. frontend: This folder contains the unified React application that provides the user interface for all system roles.

## Core System Architecture
The solution is built using the MERN stack (MongoDB, Express, React, and Node.js) and adheres to a distributed microservices pattern. 

1. API Gateway: Port 5000. Acts as the single entry point for all frontend requests, managing service discovery and port consolidation.
2. Patient Service: Port 5001. Dedicated to patient identity and profile management.
3. Doctor Service: Port 5002. Manages clinical staff attributes and medical specializations.
4. Appointment Service: Port 5003. Orchestrates scheduling logic and temporal validation.
5. Prescription Service: Port 5004. Handles clinical records, notifications, and PDF document generation.

## Individual Group Contributions

### 1. Mithussh Pushparagavan (Lead)
1. Domain Focus: Patient Management Microservice
2. Backend Implementation: patient service logic, Patient model, and profile CRUD operations
3. UI Implementation: patients management interface and global authentication context
4. Technical Responsibility: Implementation of the API Gateway and unified service routing

### 2. Kajanthan Kirubakaran
1. Domain Focus: Clinical Staff Microservice
2. Backend Implementation: doctor service logic, Doctor model, and specialization indexing
3. UI Implementation: clinical staff profiles and specialized search filtering
4. Technical Responsibility: Implementation of role based authorization and portal access security

### 3. Ashwin Visvanathan
1. Domain Focus: Appointment Orchestration Microservice
2. Backend Implementation: appointment service logic, Appointment model, and slot booking algorithms
3. UI Implementation: unified dashboard schedule and booking modals
4. Technical Responsibility: Implementation of temporal validation logic and data consistency controls

### 4. Kanzurrizk Rihan
1. Domain Focus: Clinical Documentation Microservice
2. Backend Implementation: prescription service logic, Prescription model, and notification triggers
3. UI Implementation: medical records management and professional print layouts
4. Technical Responsibility: Implementation of high fidelity prescription generation and clinical notifications

## Demo Credentials

### 1. Administrator Account
1. Email: admin@medhealth.co
2. Password: adMin#$92%gov

### 2. Clinical Staff Account
1. Email: doc@med.com
2. Password: doc@123

### 3. Patient Account
1. Email: pat@med.com
2. Password: pat@1234

## Technical Specifications and Documentation
Each microservice is fully documented using the Swagger Open API Specification. The documentation can be accessed both natively and through the API Gateway.

1. Native Patient API: localhost:5001/patients/api-docs
2. Native Doctor API: localhost:5002/doctors/api-docs
3. Native Appointment API: localhost:5003/appointments/api-docs
4. Native Prescription API: localhost:5004/prescriptions/api-docs

All endpoints are also available through the unified Gateway interface on port 5000.

## System Execution and Deployment Guide

To ensure a successful deployment even if you are not a technical expert, please follow these exact steps. This project uses a Microservices Architecture, meaning the platform is powered by 6 independent components working together.

### Step 1: Verification (Before you start)
1. Critical Rule: Only run commands from the main "MediHealth" root folder. Do not enter the subfolders like "frontend" or "patient service" to run commands.
2. Software: Ensure Node.js and MongoDB are installed on your computer.

### Step 2: One Click Installation
To install the entire system at once, open your terminal in the main "MediHealth" folder and type:
```bash
npm run install:all
```
1. What to expect: You will see a lot of text scrolling by for 1 to 2 minutes. 
2. Success: The process is finished when the scrolling stops and you see your command prompt again.

### Step 3: Launching the Platform
After installation is finished, type this one command in the same terminal:
```bash
npm start
```
1. What to expect: Your terminal will suddenly show many different colored labels (e.g., [gateway], [patient], [doctor]).
2. Success Indicators: Wait until you see "Connected to MongoDB" and "Service is running" messages appearing for all components.

### Step 4: Accessing your Portal
1. The Website: Once the terminal shows all services are running, open your web browser.
2. The Link: Type http://localhost:5173 into the address bar and press Enter.
3. Login: Use the Demo Credentials provided at the top of this document to enter the system.

### Troubleshooting Common Issues
1. Issue: "npm is not recognized". Fix: You need to install Node.js from nodejs.org.
2. Issue: "Connection error". Fix: Ensure your MongoDB application is open and running in the background.
3. Issue: "Command failed". Fix: Ensure you are in the main "MediHealth" folder and not inside a subfolder.

## Compliance and Standards
The project maintains strict adherence to the assignment of IT4020 module. Any use of external libraries is documented within the project package files.
