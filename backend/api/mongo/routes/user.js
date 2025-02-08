const express = require("express");
const router = express.Router();

const ModelController = require('../controllers/user');
const checkAuth = require('./../../middleware/check-auth');

//router.get("/", checkAuth, ModelController.get_all);
router.post("/findby", checkAuth, ModelController.find_by_props);
router.post("/", checkAuth, ModelController.create_new);
router.post("/deletemany", checkAuth, ModelController.delete_many);
router.get("/:paramId", checkAuth, ModelController.find_by_id);
router.post("/:paramId", checkAuth, ModelController.update_by_id);
router.delete("/:paramId", checkAuth, ModelController.delete_by_id);

module.exports = router;