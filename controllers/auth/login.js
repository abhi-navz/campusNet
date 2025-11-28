import User from "../../models/User.js";
import bcrypt from "bcrypt"; // Used for secure password comparison
import jwt from "jsonwebtoken"; // Used to generate the access token

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email, explicitly selecting the password hash for comparison
    const user = await User.findOne({ email }).select("+password");
    
    // Check if user exists. Using 'Invalid credentials' for both user not found
    // and wrong password is a security measure to prevent user enumeration.
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Compare input password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Create JWT payload with the user's ID
    const payload = {
      user: {
        id: user.id,
      },
    };

    // Generate Token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" }, // Token validity
      (err, token) => {
        if (err) throw err;
        
        // Login successful. Send the token and public user data.
        res.status(200).json({
          message: "Login successful",
          token, // The client needs this token
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            createdAt: user.createdAt
          },
        });
      }
    );
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default login;