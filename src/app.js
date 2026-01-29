import express from 'express'
import cors from 'cors';
import cookieParser from "cookie-parser";

// Routes
import authRoutes from "./routes/auth.routes.js";
import memberRoutes from "./routes/member.routes.js";
import documentRoutes from "./routes/document.routes.js";
import libraryRoutes from "./routes/library.routes.js";
import borrowingRoutes from "./routes/borrowing.routes.js";

const allowedOrigins = [
  "http://localhost:5173",
  "https://church-member-magement.onrender.com",
  "https://member-management-green.vercel.app"
];

const app = express();
app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Rejected Origin:", origin); // Helpful for debugging
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true , limit: '400mb'}));

// Routes

app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/borrowings", borrowingRoutes);

export default app;
