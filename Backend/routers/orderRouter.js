const orderController = require("../controllers/orderControllers");
const { fetchUser, ensureCartNotEmpty } = require("../middleware/middlewares");
const Order = require("../model/orderModel");
const OrderRouter = require("express").Router();

OrderRouter.post(
  "/checkout",
  fetchUser,
  ensureCartNotEmpty,
  orderController.checkout
);

OrderRouter.get("/admin/orders", orderController.adminOrders);

OrderRouter.put("/admin/orders/:id/status", orderController.adminUpdateOrder);

OrderRouter.get("/my-orders", fetchUser, orderController.getUsersOrders);

OrderRouter.delete("/admin/orders/:id", orderController.deleteOrderById);

module.exports = OrderRouter;
