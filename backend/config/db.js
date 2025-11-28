import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Removed deprecated options: useNewUrlParser and useUnifiedTopology
    await mongoose.connect(process.env.MONGO_URI, {}); 
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;