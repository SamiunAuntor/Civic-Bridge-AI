const express = require("express");

const router = express.Router();

const verifyFirebaseToken = require("../middleware/auth.middleware");

const { getRoadmap, } = require("../controllers/roadmap.controller");

router.get(
    "/:assessmentId",
    verifyFirebaseToken,
    getRoadmap
);

module.exports = router;