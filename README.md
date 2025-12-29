# ParkX - Smart Parking Management System

ParkX is a full-stack parking management solution designed to streamline vehicle parking operations. It features real-time slot management, QR-based entry/exit, comprehensive analytics, and a secure administrative dashboard./

## 🚀 Features

- **Real-time Slot Tracking**: Monitor parking slot occupancy in real-time.
- **Admin Dashboard**: Manage parking zones, add/remove slots, and manually toggle availability.
- **Analytics**: Visual dashboard for revenue, occupancy trends, and vehicle duration.
- **Secure Authentication**: Cookie-based authentication for administrative access.
- **Responsive UI**: Built with React, Tailwind CSS, and DaisyUI for a modern, mobile-friendly interface.
- **QR Integration**: (Ready for) QR code scanning for seamless vehicle entry and exit.

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: Custom Cookie-based Auth
- **Tools**: Dotenv, CORS, Cookie-Parser

### Frontend
- **Framework**: React 19 (via Vite)
- **Styling**: Tailwind CSS, DaisyUI
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **Visualization**: Recharts
- **Icons**: Lucide React, Heroicons

## 📂 Project Structure

```bash
ParkX/
├── backend/            # Node.js/Express API
│   ├── config/         # Database configuration
│   ├── controllers/    # Business logic
│   ├── models/         # Mongoose schemas (Parking, Slot)
│   ├── routes/         # API endpoints
│   └── server.js       # Entry point
│
└── frontend/           # React Client
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── Utils/      # Constants and Helpers
    │   └── ...
    └── ...
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local instance or MongoDB Atlas)

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=securepassword123
   NODE_ENV=development
   ```
   *(Note: `FRONTEND_BASE_URL` logic is handled in `utils/constants.js` or `server.js`, verify if you need to override it)*

4. Start the server:
   ```bash
   npm start
   ```

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and visit the URL shown (usually `http://localhost:5173`).


## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
