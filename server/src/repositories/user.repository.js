const supabase = require("../config/supabase");

const findByFirebaseUid = async (firebaseUid) => {
    return await supabase
        .from("users")
        .select("*")
        .eq("firebase_uid", firebaseUid)
        .single();
};

const createUser = async (userData) => {
    return await supabase
        .from("users")
        .insert(userData)
        .select()
        .single();
};

module.exports = {
    findByFirebaseUid,
    createUser,
};