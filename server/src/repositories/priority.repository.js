const supabase = require("../config/supabase");

const createPriorities = async (priorities) => {
    return await supabase
        .from("priorities")
        .insert(priorities);
};

module.exports = {
    createPriorities,
};