const supabase = require("../config/supabase");

const getAllResources = async () => {
    return await supabase
        .from("resources")
        .select("*");
};

module.exports = {
    getAllResources,
};