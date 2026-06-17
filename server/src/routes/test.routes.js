const express = require("express");

const verifyFirebaseToken = require(
    "../middleware/auth.middleware"
);

const router = express.Router();

router.get(
    "/protected",
    verifyFirebaseToken,
    (req, res) => {
        res.json({
            success: true,
            user: req.user,
        });
    }
);

module.exports = router;