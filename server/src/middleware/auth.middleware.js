const admin = require("../config/firebase");

const userService = require("../services/user.service");

const verifyFirebaseToken = async (req, res, next) => {
    try {
        const authHeader =
            req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "No token provided",
            });
        }

        const token = authHeader.split(" ")[1];

        const decodedToken =
            await admin.auth.verifyIdToken(token);

        const dbUser =
            await userService.syncUser(
                decodedToken
            );

        req.user = decodedToken;

        req.dbUser = dbUser;

        next();
    } catch (error) {
        console.error(error);

        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
};

module.exports = verifyFirebaseToken;
