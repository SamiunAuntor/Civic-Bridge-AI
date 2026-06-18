const express = require("express");

const router = express.Router();

const verifyFirebaseToken = require("../middleware/auth.middleware");

const { getRecommendations, } = require("../controllers/resource.controller");

router.post(
    "/recommend",
    verifyFirebaseToken,
    getRecommendations
);

module.exports = router;