const express = require("express");

const router = express.Router();

const verifyFirebaseToken = require("../middleware/auth.middleware");

const { createSimulation, } = require("../controllers/simulation.controller");

router.post(
    "/",
    verifyFirebaseToken,
    createSimulation
);

module.exports = router;