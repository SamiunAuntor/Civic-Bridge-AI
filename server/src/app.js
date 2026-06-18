const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/user.routes");
const assessmentRoutes = require("./routes/assessment.routes");
const roadmapRoutes = require("./routes/roadmap.routes");
const simulationRoutes = require("./routes/simulation.routes");
const priorityRoutes = require("./routes/priority.routes");
const resourceRoutes = require("./routes/resource.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/roadmaps", roadmapRoutes);
app.use("/api/simulations", simulationRoutes);
app.use("/api/priorities", priorityRoutes);
app.use("/api/resources", resourceRoutes);

module.exports = app;