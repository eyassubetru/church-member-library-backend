import express from 'express'
import cors from 'cors';

// Routes
import authRoutes from "./routes/auth.routes.js";
import memberRoutes from "./routes/member.routes.js";
// import libraryRoutes from "./routes/library.routes.js";
// import borrowingRoutes from "./routes/borrowing.routes.js";
// import adminRoutes from "./routes/admin.routes.js";
// import statsRoutes from "./routes/stats.routes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true , limit: '400mb'}));

// Routes

app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
// app.use("/api/library", libraryRoutes);
// app.use("/api/borrowings", borrowingRoutes);
// app.use("/api/admins", adminRoutes);
// app.use("/api/stats", statsRoutes);

export default app;
