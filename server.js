// Load environment variables early
const dotenv = require("dotenv");
dotenv.config();

// Core dependencies
const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

// Local imports
const connectDB = require("./config/db");
const userRoutes = require("./routes/user.route");

const app = express();


// Global Middlewares
app.use(helmet());

// Parse incoming JSON payloads
app.use(express.json());

// Apply rate limiting to all /api routes
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: "Too many requests. Please try again after an hour.",
});
app.use("/api", limiter);

// Data sanitization against NoSQL query injection and XSS
app.use(mongoSanitize());           
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp());


// Routes
 

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Authentication routes
app.use("/api/v1/auth", userRoutes);

// Handle all undefined routes
app.all("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});




// Server Initialization

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(` Server running at http://localhost:${PORT}`);
  });
});
