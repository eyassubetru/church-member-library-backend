import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js'
import mongoose from 'mongoose';


const PORT = process.env.PORT || 5000;

async function startServer () {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    console.log('MONGODB CONNECTED');

    app.listen(PORT, ()=>{
        console.log(`SERVER IS RUNNING ON PORT ${PORT}`)
    })
    } catch (error) {
        console.error(" SERVER STARTUP FAILED:", error);
        process.exit(1)
    }

}

startServer();