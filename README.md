🌿 Gram Dhara – Rural Water Management Empowerment System

Smart India Hackathon 2025 | Ministry of Jal Shakti (MoJS)
Problem Statement: Empowering Gram Panchayats to manage daily Operation & Maintenance (O&M) of Rural Piped Water Supply Systems using low-cost digital tools for routine monitoring.
Theme: Clean & Green Technology
Problem ID: SIH25241

🌍 Overview

Gram Dhara is a full-stack web platform designed to digitize the operation and maintenance of rural piped water supply systems.
It empowers Gram Panchayats to monitor, log, and manage daily water distribution activities using low-cost digital tools — enabling transparency, accountability, and sustainable water governance.

The system bridges the gap between local water operators, Gram Panchayat members, and district officials through real-time data, analytics, and community engagement.

🧩 Project Layers
💠 Frontend

A user-friendly interface for Panchayat officials, operators, and administrators built with modern, responsive web technologies.

⚙️ Backend

A secure, scalable service layer that handles user roles, data processing, analytics, and IoT integrations.

🎥 Demo & Resources

🎬 Demo Video: [To be added]
🌐 Deployed Site: [Visit Here]
📊 Project PPT: [View Presentation]
📂 GitHub Repository: Gram Dhara

| Name               | Roll No.    | Role                          |
| ------------------ | ----------- | ----------------------------- | |
| Devyansh Dingolia  | 2024UCS1538 | Full-Stack Developer          |
| Janardhan Verma    | 2024UCS1539 | Backend Engineer              |
| Yash Kumar         | 2024UCS1535 | Frontend Developer            |
| Manish Mandia      | 2024UCS1576 | Frontend Developer            |
| Sakshi Yadav       | 2024UCS1575 | Backend Developer             |
| Bhardwaj Kartikey  | 2024UCS1540 | AI/ML Engineer |

📂 Project Structure
gram-dhara/
│
├── frontend/              # User & admin interfaces (HTML, CSS, JS)
│   ├── index.html         # Landing page with overview & quick stats
│   ├── dashboard.html     # Panchayat operator dashboard
│   ├── complaints.html    # Maintenance logs & issue tracker
│   ├── reports.html       # Analytics and system performance charts
│   ├── login.html         # Authentication interface
│   ├── js/                # Scripts for APIs and data handling
│   └── style/             # Tailwind & custom CSS files
│
├── backend/               # Core application logic (Node.js + Express)
│   └── src/
│       ├── controllers/   # Handles user actions, water logs, reports
│       ├── models/        # MongoDB schemas (Users, Reports, Tanks)
│       ├── routes/        # RESTful APIs for frontend integration
│       ├── middlewares/   # Auth & access control layers
│       └── utils/         # IoT integration, notifications, analytics
│
└── README.md              # Project documentation


💧 1. Frontend: Panchayat-Centric Design
👤 Operator Experience

Daily Log Interface: Record tank levels, water flow, and supply timings.

Maintenance Tracker: Log pipe leaks, valve issues, and repair requests.

Complaint Management: Citizens can raise issues related to water supply.

Multilingual UI: Simple Hindi/English toggling for accessibility.

🏛️ Administrator Experience

Real-Time Dashboard:

Overview of village-wise water distribution status.

Alerts for irregular supply or missed logs.

Report Generator:

Generate daily/weekly/monthly reports in PDF or Excel.

Performance Monitoring:

Track maintenance time, issue categories, and resource usage.

⚙️ 2. Backend: Secure & Scalable Engine

The backend powers the full workflow — managing users, complaints, maintenance schedules, IoT feeds, and data analytics.

🔑 Core Functionalities
User & Role Management

Secure JWT-based login for operators, admins, and super admins.

Role-based access controls for protected operations.

Water Supply Monitoring

APIs to fetch and store daily water logs (tank level, hours of supply).

Predictive alerts for low tank levels or irregular supply.

Complaint & Maintenance Lifecycle

Create → Assign → Resolve flow with full traceability.

Automatic logging of every status update with timestamps.

IoT Integration (Optional)

Supports future sensor connections for water flow and pressure monitoring.

Automatic readings to reduce manual errors.

🧰 3. Technical Details
Layer	Stack
Frontend	HTML, CSS, JS, Tailwind CSS
Backend	Node.js, Express.js
Database	MongoDB (Mongoose)
Authentication	JWT + bcrypt
File Handling	Multer + Cloud Storage
Task Scheduling	Node-cron (automated reports & checks)
Email/Alerts	Nodemailer
Hosting	Render / Railway / Vercel
🔒 Backend Technical Highlights
Role-Based Access Control (RBAC)

Ensures Panchayat users can only access their own village data.

District Admins have full analytics access.

Automated Notifications

Cron jobs run daily to check for missing reports or unaddressed complaints.

Sends reminder emails & in-app alerts.

Data Analytics Engine

MongoDB aggregation pipelines compute:

Total daily supply hours

Average maintenance response time

Leak frequency and distribution trends

📊 Typical Workflow

Login / Register → Panchayat or Admin authenticates securely.

Daily Data Entry → Operator logs water metrics & maintenance updates.

Backend Processing → Data validated, anomalies flagged.

Alerts Triggered → Low supply or maintenance delays send notifications.

Admin Review → View consolidated analytics dashboard.

Report Generation → Export insights for review or funding reports.

💡 Innovation & Impact

Empowers rural self-governance through accessible digital tools.

Reduces operational costs via predictive maintenance alerts.

Supports Jal Jeevan Mission goals by ensuring real-time accountability.

Designed for low internet and low-resource environments.

Open-source and scalable for state-level adoption.

🚀 Future Roadmap

Mobile app for on-the-go Panchayat operators.

AI-based water demand prediction.

Integration with BharatNet for rural data connectivity.

IoT sensor network for smart water flow management.

Real-time GIS map visualization of all supply lines.

🏁 Outcome

Gram Dhara enables data-driven, transparent, and sustainable management of rural water systems —
giving Gram Panchayats the power to own and operate their water supply with efficiency and accountability.

💧 “Every drop counts — when every village is digitally empowered.”
