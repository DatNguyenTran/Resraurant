const express = require("express");
const paymentRouter = express.Router();
const isAuth = require("../app/middlewares/is-auth");
const paymentController = require("../app/controllers/PaymentController");

paymentRouter.get(
  "/:bookingId",
  isAuth.requireAuth,
  paymentController.reOpenPayment
);
paymentRouter.get(
  "/:orderId/order",
  isAuth.requireAuth,
  paymentController.paymentOrder
);
paymentRouter.get(
  "/subscription/payment/:plan",
  paymentController.paymentSubscription
);
paymentRouter.get(
  "/:description/checkPaid",
  paymentController.checkPaid
);


module.exports = paymentRouter;
