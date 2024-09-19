const Users = require("../model/userModel");
const jwt = require('jsonwebtoken');

// Middleware to ensure the user's cart is not empty
const ensureCartNotEmpty = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await Users.findById(userId);

    if (!user || !user.cartData || user.cartData.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Cart is empty." });
    }
    next();
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Middleware to authenticate user based on JWT token
const fetchUser = (req, res, next) => {
  const token = req.header("auth-token");

  if (!token) {
    return res
      .status(401)
      .send({ errors: "Please authenticate using a valid token" });
  }

  try {
    const data = jwt.verify(token, "secret_ecom");
    req.user = data.user; // Attach the decoded user information to the request
    next(); // Continue to the next middleware or controller
  } catch (error) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
};

module.exports = { ensureCartNotEmpty, fetchUser };