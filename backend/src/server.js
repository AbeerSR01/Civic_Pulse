import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { initDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initDB();
  } catch (err) {
    console.error("⚠️ [Database Init Notice]:", err.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();
