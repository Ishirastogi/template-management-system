# 📝 Template Management System

A web-based application to manage internal templates with approval workflows. Users can submit templates, and Admins/Managers can **Approve**, **Reject**, or **Modify** them. All status changes can be tracked via the `FormStatus` page.

---

## 🚀 Features

- 🔐 Login system with roles: Admin, Manager, and User  
- 📄 Submit template forms with fields such as:
  - Department, For, From, Purpose, Unit, File, etc.
- ✅ Admins/Managers can Approve, Reject, or Mark as Modified  
- 📬 Email notifications sent for approval requests  
- 📂 Track form statuses (Approved / Rejected / Modified) in the **FormStatus** page  
- 🔍 Search and manage templates through a centralized list

---

## 🧰 Tech Stack

**Frontend:**
- React.js  
- React Router  
- Axios  
- Tailwind CSS *(or Custom CSS)*

**Backend:**
- Node.js + Express  
- MongoDB (via Mongoose)

---

## 🏗️ Folder Structure

```bash
template-management-system/
├── backend/
│   ├── models/         # MongoDB models
│   ├── routes/         # Express routes (e.g., forms, auth)
│   └── server.js       # Entry point for backend
│
├── frontend/
│   ├── components/     # React components (TemplateList, TemplateForm, FormStatus)
│   ├── pages/          # Page-level components
│   ├── styles/         # CSS or Tailwind
│   └── App.js          # React app entry
│
├── .env                # Environment variables
├── README.md           # Project overview
└── package.json        # Project config
```

---

## ⚙️ Setup Instructions

### 1. 📦 Clone the Repository

```bash
git clone https://github.com/your-username/template-management-system.git
cd template-management-system
```

### 2. 🔧 Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` with the following:

```ini
PORT=5000
MONGO_URI=your_mongodb_connection_string
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password_or_app_password
```

Start the backend server:

```bash
npm run dev
```

The backend should now be running on [http://localhost:5000](http://localhost:5000).

### 3. 🎨 Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file inside `frontend/` with:

```bash
REACT_APP_API_URL=http://localhost:5000/api
```

Start the React development server:

```bash
npm start
```

The frontend should now be running on [http://localhost:3000](http://localhost:3000).
