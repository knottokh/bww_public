const express = require("express");
const router = express.Router();
const ImportController = require('../controllers/import');
const checkAuth = require('./../../middleware/check-auth');

router.post("/import-with-body", checkAuth, ImportController.ImportWithBody);

module.exports = router;