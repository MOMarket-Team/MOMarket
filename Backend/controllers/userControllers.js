const Users = require("../model/userModel");
const jwt = require("jsonwebtoken");

const userController = {
  registerUser: async (req, res) => {
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
      return res
        .status(400)
        .json({ success: false, errors: "existing email address" });
    }
    const user = new Users({
      name: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });

    await user.save();

    const data = { user: { id: user.id } };
    const token = jwt.sign(data, "secret_ecom");
    res.json({ success: true, token });
  },

  loginUser: async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
      const passCompare = req.body.password === user.password;
      if (passCompare) {
        const data = { user: { id: user.id } };
        const token = jwt.sign(data, "secret_ecom");
        res.json({ success: true, token });
      } else {
        res.json({ success: false, errors: "Wrong Password" });
      }
    } else {
      res.json({ success: false, errors: "wrong Email Id" });
    }
  },
  getUser: (req, res) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Access Denied" });
    }

    try {
      const data = jwt.verify(token, "secret_ecom");
      Users.findById(data.user.id, { name: 1, email: 1 })
        .then((user) => res.json({ success: true, user }))
        .catch(() =>
          res.status(500).json({ success: false, message: "Internal Error" })
        );
    } catch {
      res.status(401).json({ success: false, message: "Invalid Token" });
    }
  },
  customer: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id);
      if (user) {
        res.json({
          success: true,
          customer: { email: user.email, name: user.name },
        });
      } else {
        res.json({ success: false, message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error });
    }
  },
};

module.exports = userController;
