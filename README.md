# WasteVision: An AI-Powered Web Platform for Smart Waste Segregation and Environmental Data Reporting

## Overview

WasteVision is an AI-powered web platform designed to promote smart waste segregation and environmental awareness through machine learning. The system classifies waste materials into categories such as hazardous, biodegradable, non-biodegradable, and recyclable based on uploaded images. By leveraging intelligent image recognition, users can easily identify the correct waste type, supporting eco-friendly disposal practices. The platform also allows users to manage their profiles, track classification history, and generate detailed reports that can be viewed or downloaded as PDF copies for documentation or environmental reporting purposes.

---

## Features

🧠 AI Waste Classification: Automatically identifies and categorizes waste using machine learning.

🖼️ Image Upload Tracking: Users can upload images of waste for analysis and record-keeping.

📊 Result History: View past waste classification results with timestamps and details.

📄 PDF Report Generation: Download classification results as professional PDF reports.

👤 User Profile Management: Update and manage user information and activity history.

🌍 Environmental Data Insights: Summarized data on waste types to promote awareness and sustainability.

🔐 Secure Access: Ensures data privacy and authorized access for all users.

---

## Tech Stack

- **Backend:** Python (FastAPI), Uvicorn, NodeJS, Express
- **Frontend (Web):** React with Vite  
- **Database:** MongoDB (configurable with other databases)  
- **Runtime Environment:** Node.js and Python 3.10+  

---

## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- Python 3.10+
- pip (Python package manager)
- Virtual environment (venv) for backend
- Git



### Frontend (Web Application)
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

---

### Backend (API Server)

```bash
cd backend

# install dependencies
npm install

# run locally at port 4000
nodemon server.js
```

---

### ML Service (API Server)

```bash
cd ml_service

# Create virtual environment (only first time)
python -m venv venv

# Activate virtual environment (Windows)
.venv\Scripts\activate

# Activate virtual environment (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI with Uvicorn
uvicorn main:app  --port 5000 --reload


```

---

