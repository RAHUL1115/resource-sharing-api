const jwt = require("jsonwebtoken");

// Middleware to authenticate the user
const authenticateUser = (req, res, next) => {
  try {
    // Retrieve token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Token missing or invalid" });
    }

    const token = authHeader.split(" ")[1]; // Extract the token

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user payload to the request
    req.user = decoded; // Example: { id: 'uuid', email: 'user@example.com' }

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = { authenticateUser };
