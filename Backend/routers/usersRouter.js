const UsersRouter = require("express").Router();
const { fetchUser } = require("../middleware/middlewares");
const userController = require("../controllers/userControllers");

UsersRouter.post("/signup", userController.registerUser);

UsersRouter.post("/login", userController.loginUser);

UsersRouter.get("/getuser", userController.getUser);

UsersRouter.get("/customer", fetchUser, userController.customer);

module.exports = UsersRouter;
