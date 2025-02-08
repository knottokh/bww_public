const express = require("express");
const router = express.Router();

const AuthController = require('../controllers/auth');
const checkAuth = require('./../../middleware/check-auth');

//router.get("/", AuthController.user_get_all);
//router.get("/:paramId", AuthController.user_by_id);
router.post("/sign_in", AuthController.sign_in);
router.post("/sign_out", AuthController.sign_out);
router.post("/forgot_password", AuthController.user_forgot_password);
router.post("/change_password", AuthController.user_change_password);
router.post("/reset_password" , AuthController.user_reset_password);
router.post("/leave_notification" , AuthController.leave_request_notification);
//router.post("/reset_password", UserController.reset_password);
//router.get("/email",UserController.testsendemdil);

module.exports = router;
