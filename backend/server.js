require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const parkingRoutes = require("./routes/parkingRoutes");
const slotRoutes = require("./routes/slotRoutes");
const cookieParser = require("cookie-parser");
const analyticsRoutes = require("./routes/analyticsRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const { getExpectedToken } = require("./utils/authHelper");


const app = express();
app.use(cookieParser());

/* Middleware */
const  FRONTEND_BASE_URL = require("./utils/constants.js");

console.log(FRONTEND_BASE_URL)
app.use(
  cors({
    origin: FRONTEND_BASE_URL, // Make sure this matches the frontend origin exactly
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"], // Ensure PATCH is included
    allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
    credentials: true, // Allow cookies and credentials
  })
);app.use(express.json());


/* Database connection */
connectDB();

/* Routes */
app.use("/api/parking", authMiddleware, parkingRoutes);
app.use("/api/slots", authMiddleware, slotRoutes); 
app.use("/api/analytics", authMiddleware, analyticsRoutes);


/* Health check */
app.get("/", (req, res) => {
  res.send("ParkX backend is running");
});

app.post("/adminLogin", (req, res) => {
    // Destructure directly from req.body, NOT req.body.formData
    const { username, password } = req.body; 
    
    if (
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
    ) {
        res.cookie(
            "token",
            getExpectedToken(),
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
                maxAge: 7 * 24 * 60 * 60 * 1000, // Use maxAge for simplicity
            }
        );
        res.status(200).send("authenticated");
    } else {
        res.status(400).send("Invalid credentials");
    }
});

// 4. Update the Auth Check
app.get("/checkAuth", (req, res) => {
    const token = req.cookies.token; 
    const expectedToken = getExpectedToken();
    
    if (token === expectedToken) {
        return res.json({ authenticated: true });
    }
    res.json({ authenticated: false });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

