const userRepository = require(
    "../repositories/user.repository"
);

const syncUser = async (firebaseUser) => {
    const { data: existingUser, error } =
        await userRepository.findByFirebaseUid(
            firebaseUser.uid
        );

    if (error && error.code !== "PGRST116") {
        throw error;
    }

    if (existingUser) {
        return existingUser;
    }

    const { data: newUser, error: createError } =
        await userRepository.createUser({
            firebase_uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.name || "",
        });

    if (createError) {
        throw createError;
    }

    return newUser;
};

module.exports = {
    syncUser,
};