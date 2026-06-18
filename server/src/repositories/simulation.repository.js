const supabase = require("../config/supabase");

const createSimulation = async (simulationData) => {
    return await supabase
        .from("simulations")
        .insert(simulationData)
        .select()
        .single();
};

module.exports = {
    createSimulation,
};