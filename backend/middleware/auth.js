import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // Check for the 'Authorization' header in the request
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Tokens are typically sent as "Bearer <TOKEN>". Extract the token part.
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Verify the token using the secret key from the .env file
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the decoded payload (which contains { user: { id: ... } }) to the request
    req.user = decoded.user;
    
    // Proceed to the next middleware or controller
    next();
  } catch (err) {
    // If verification fails (e.g., token expired, invalid secret)
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default authMiddleware;