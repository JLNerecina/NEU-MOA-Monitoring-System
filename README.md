# 🏛️ NEU MOA Monitoring System

> **A sophisticated, glassmorphism-based platform for managing and monitoring Memorandums of Agreement (MOA) at New Era University.**

---

## 🌟 Overview

The **NEU MOA Monitoring System** is a modern web application designed to streamline the lifecycle of partnership agreements. Built with a focus on transparency, security, and user experience, it provides university administrators and faculty with a centralized hub to track, update, and audit institutional partnerships.

✨ **[Try the App Live Here!](https://neu-moa-monitoring-system-230692279419.us-west1.run.app)** ✨

![System Preview](https://github.com/JLNerecina/NEU-MOA-Monitoring-System/blob/main/public/NEU%20MOA%20Monitoring%20System%20Preview.png)

---

## ✨ Key Features

### 🛡️ Secure Authentication
- **University-Exclusive Access:** Restricted to `@neu.edu.ph` Google accounts.
- **Role-Based Access Control (RBAC):** Distinct permissions for Students, Faculty, and Administrators.

### 📋 MOA Lifecycle Management
- **Comprehensive Tracking:** Monitor HTE (Host Training Establishment) IDs, company details, and industry types.
- **Real-time Status Updates:** Track agreements from "Processing" to "Approved" and "Expired".
- **Automatic Expiration Alerts:** The system automatically flags agreements expiring within 60 days.

### 🕵️ Audit & Transparency
- **Detailed Audit Trails:** Every action (Create, Update, Delete, Recover, Auto-Update) is logged with a timestamp and the user responsible.
- **Soft Delete System:** Prevent accidental data loss with a recovery-friendly deletion process.

### 🤖 Smart Automation
- **Intelligent Expiration:** Automatically flags MOAs expiring in 2 months.
- **Manual Override Protection:** The system respects manual status updates and won't overwrite user-defined statuses with automatic ones.

### 🎨 Modern UI/UX
- **Glassmorphism Design:** A sleek, translucent interface that feels premium and modern.
- **Adaptive Theme:** Seamlessly switch between **Light** and **Dark** modes.
- **Responsive Dashboard:** Real-time statistics and data visualization.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS |
| **Backend/DB** | Firebase Firestore |
| **Auth** | Firebase Authentication (Google OAuth) |
| **Icons** | Lucide React |
| **Animation** | Framer Motion (via `motion/react`) |
| **Styling** | Glassmorphism, Utility-first CSS |

---

## 👥 User Roles

### 🎓 Student
- View approved MOAs.
- Search for active partnerships.

### 🏫 Faculty
- View all MOAs (including processing).
- Add new MOA entries.
- Update existing MOA details.
- Soft-delete and recover records.

### 🔑 Administrator
- Full system access.
- **User Management:** Block/Unblock users, change roles, and delete accounts.
- **System Configuration:** Manage global settings and audit logs.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Firebase Project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/neu-moa-system.git
   cd neu-moa-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `firebase-applet-config.json` in the root directory:
   ```json
   {
     "apiKey": "YOUR_API_KEY",
     "authDomain": "YOUR_AUTH_DOMAIN",
     "projectId": "YOUR_PROJECT_ID",
     "storageBucket": "YOUR_STORAGE_BUCKET",
     "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
     "appId": "YOUR_APP_ID"
   }
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

---

## 🔒 Security Rules

The system employs strict Firestore Security Rules to ensure data integrity:
- **Default Deny:** All access is denied unless explicitly permitted.
- **Validation:** Data types and formats are validated server-side.
- **Ownership:** Users can only modify data they are authorized for based on their role.

---

## 📄 License

This project is developed for **New Era University**. All rights reserved.

---

<p align="center">
   Made with ❤️ for the NEU Community       
</p>
<p align="center">      
   Created by John Lian R. Nerecina          
</p>
<p align="center">
   Github: @JLNerecina     
</p>
