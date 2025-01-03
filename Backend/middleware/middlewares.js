export const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token)
    return res
      .status(401)
      .send({ errors: "Please authenticate using a valid token" });

  try {
    const data = jwt.verify(token, "secret_ecom");
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
};

export const ensureCartNotEmpty = (req, res, next) => {
  console.log("Processing cart data:", req.user.id);

  console.log("request body", req.body);

  // Check if cart is empty
  if (
    !req.body.cartData ||
    Object.values(req.body.cartData).every((item) => item === 0)
  ) {
    return res.status(400).json({ success: false, message: "Cart is empty." });
  }

  next();
};
