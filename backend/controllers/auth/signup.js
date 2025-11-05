import User from "../../models/User.js";

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

    // create and save new user
    const newUser = new User({ fullName, email, password });
    await newUser.save();

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default signup;
