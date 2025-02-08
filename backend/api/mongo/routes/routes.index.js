const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const authRoutes = require("./auth");
const userRoutes = require("./user");
const fileRoutes = require("./upload");
const paymentRoutes = require("./payment");
const shippingRoutes = require("./shipping");
const stockRoutes = require("./stock");
const productRoutes = require("./product");
const quotationRoutes = require("./quotation");
const customerRoutes = require("./customer");
const attachmentRoutes = require("./attachment");
const quotationAttachmentRoutes = require("./quotation_attachment");
const importRoutes = require("./import");
const sellerRoutes = require("./seller");

router.get("/", (req, res) => {
  res.json({ message: "API is online" });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/files", fileRoutes);
router.use("/payments", paymentRoutes);
router.use("/shippings", shippingRoutes);
router.use("/stocks", stockRoutes);
//router.use("/products", productRoutes);
router.use("/quotations", quotationRoutes);
router.use("/customers", customerRoutes);
router.use("/attachments", attachmentRoutes);
router.use("/quotation_attachments", quotationAttachmentRoutes);
router.use("/sellers", sellerRoutes);

router.use("/imports", importRoutes);

router.get("/password/:paramPassword", (req, res, next) => {
  //console.log(req.params.paramPassword);
  let bcrypass = bcrypt.hashSync(req.params.paramPassword, 10);
  res.json({
    hash_password: bcrypass,
  });
});

module.exports = router;
