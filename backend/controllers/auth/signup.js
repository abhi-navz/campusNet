import User from "../../models/User.js";
import bcrypt from "bcrypt"; // Used for secure password hashing
import jwt from "jsonwebtoken"; // Used to create a unique access token

const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // basic validation
    if (!fullName || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create and save new user (store the HASHED password)
    const newUser = new User({ fullName, email, password: hashedPassword });
    await newUser.save();

    // Create JWT payload
    const payload = {
      user: {
        id: newUser.id,
      },
    };

    // Generate Token
    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Uses the secret key from .env
      { expiresIn: "1h" }, // Token validity
      (err, token) => {
        if (err) throw err;

        // Response includes the new token and user data
        res.status(201).json({
          message: "Signup successful",
          token,
          user: {
            id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
          },
        });
      }
    );
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default signup;
