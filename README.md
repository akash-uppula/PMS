# 🧩 Product Management System (PMS)

### 🚀 Overview
The **Product Management System (PMS)** is a **full-stack web application** designed to help organizations efficiently **manage their products, track sales, and monitor overall performance** through an intuitive dashboard.

Admins can **add, update, or delete products**, manage **orders and invoices**, and access **real-time sales reports** — all from a unified interface.  
This project demonstrates **scalable architecture**, **secure authentication**, and **modern responsive UI**, making it suitable for real-world business use cases.

---

## ⚙️ Tech Stack

### 🖥️ Frontend
- **HTML5**, **CSS3**, **JavaScript (ES6)**
- **Bootstrap 5** – for responsive and elegant UI design
- **React.js** – component-based UI framework
- **Axios** – for REST API communication
- **Recharts** – for data visualization and reports

### 💾 Backend
- **Node.js** with **Express.js** – for API and business logic
- **MongoDB** with **Mongoose** – for flexible and scalable data storage
- **JWT Authentication** – for secure login sessions
- **Bcrypt.js** – for password hashing

---

## ✨ Features

### 👤 User Management
- Secure login and signup using **JWT**
- Role-based access (Host Admin / Organization Admin / Employee)
- Encrypted passwords using **Bcrypt.js**

### 🛍️ Product Management
- Add, edit, delete, and view products
- Manage categories, pricing, and stock details
- Search and filter functionality for quick access
- Real-time updates using API integration

### 💹 Sales & Revenue Tracking
- Interactive dashboard for viewing **weekly**, **monthly**, or **yearly** reports
- Graphical representation using **Recharts**
- Profit & Loss (P&L) reports for organization admins
- Supports data filtering by date range

### 🧾 Order & Invoice Management
- Create and manage product orders
- Generate **PDF receipts** using **jsPDF**
- Auto-calculate total price and taxes
- Track order and payment details

### 🏢 Organization Management
- Multi-organization system with isolated data
- Host Admin can manage multiple organizations
- Organization Admins manage their employees and products

---

## 📊 Reports Module
- Sales performance analytics
- Organization-specific revenue tracking
- System-wide reports for host admins
- Custom date range filters for detailed analysis

---

## 🎨 UI/UX Highlights
- Clean and responsive layout using **Bootstrap 5**
- Card-based dashboard design
- Hover effects and shadows for interactivity
- Mobile-friendly and consistent color palette (blue, white, gray)

---

## 🧩 Folder Structure
- PMS/
- │
- ├── frontend/
- │ ├── public/
- │ ├── src/
- │ │ ├── components/ # Reusable UI components
- │ │ ├── pages/ # Main application pages
- │ │ ├── api/ # Axios API integration
- │ │ ├── App.js # Main React app
- │ │ └── index.js # Entry point
- │ ├── package.json
- │ └── README.md
- │
- └── backend/
- ├── models/ # Mongoose schemas
- ├── routes/ # Express routes
- ├── controllers/ # Business logic
- ├── server.js # Node.js entry point & MongoDB connection setup
- ├── package.json
- └── .env # Environment variables


---

## 🧩 Configure Environment Variables
- MONGO_URI=your_mongodb_connection_string
- JWT_SECRET=your_secret_key
- PORT=5000

---

## ⚡ Installation & Usage

### 🔹 1. Clone the Repository
```bash
git clone https://github.com/akash-uppula/PMS.git
cd PMS

cd frontend
npm install

cd ../backend
npm install

# Start backend
cd backend
npm start

# Start frontend
cd ../frontend
npm run dev
```
---

