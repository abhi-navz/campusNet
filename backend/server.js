import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
