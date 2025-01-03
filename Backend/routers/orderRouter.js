const orderController = require("../controllers/orderControllers");
const { fetchUser, ensureCartNotEmpty } = require("../middleware/middlewares");
const OrderRouter = require("express").Router();

OrderRouter.get("/my-orders", fetchUser, orderController.getUsersOrders);

OrderRouter.post(
  "/checkout",
  fetchUser,
  ensureCartNotEmpty,
  orderController.checkout
);

OrderRouter.get("/admin/orders", orderController.adminOrders);

OrderRouter.put("/admin/orders/:id/status", orderController.adminUpdateOrder);

OrderRouter.delete("/admin/orders/:id", orderController.deleteOrderById);

module.exports = OrderRouter;
