const express = require("express");
const router = express.Router();

const ModelController = require("../controllers/quotation");
const checkAuth = require("../../middleware/check-auth");

router.get("/", checkAuth, ModelController.get_all);
router.post("/findby", ModelController.find_by_props);
router.post("/finddetail", checkAuth, ModelController.find_detail_by_props);
router.post("/findnototal", checkAuth, ModelController.find_no_total);
router.post("/", checkAuth, ModelController.manage_data);
router.post("/deletemany", checkAuth, ModelController.delete_many);
router.get("/:paramId", ModelController.find_by_id);
router.post(
  "/updatestatusapprove/:paramId",
  checkAuth,
  ModelController.update_status_approve
);
router.post("/updateallapprove", checkAuth, ModelController.update_all_approve);
router.post("/updatealltotal", checkAuth, ModelController.update_all_total);
router.post(
  "/updatequotationstock/:paramId",
  checkAuth,
  ModelController.update_quotation_stock_by_id
);
router.post("/:paramId", checkAuth, ModelController.update_by_id);
router.delete("/:paramId", checkAuth, ModelController.delete_by_id);

module.exports = router;
