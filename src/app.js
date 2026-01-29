import express from 'express'
import cors from 'cors';
import cookieParser from "cookie-parser";

// Routes
import authRoutes from "./routes/auth.routes.js";
import memberRoutes from "./routes/member.routes.js";
import documentRoutes from "./routes/document.routes.js";
import libraryRoutes from "./routes/library.routes.js";
import borrowingRoutes from "./routes/borrowing.routes.js";

const app = express();
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true, // Allow credentials
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true , limit: '400mb'}));

// Routes

app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/borrowings", borrowingRoutes);

export default app;
