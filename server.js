import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js'
import mongoose from 'mongoose';
import cron from "node-cron";
import { markOverdueBorrowings } from "./src/controllers/borrowing.controller.js";

const PORT = process.env.PORT || 5000;



cron.schedule("0 0 * * *", async () => {
  console.log("Checking overdue borrowings...");
  await markOverdueBorrowings();
});

async function startServer () {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    console.log('MONGODB CONNECTED');

    app.listen(PORT, '0.0.0.0', ()=>{
        console.log(`SERVER IS RUNNING ON PORT ${PORT}`)
    })
    } catch (error) {
        console.error(" SERVER STARTUP FAILED:", error);
        process.exit(1)
    }

}

startServer();