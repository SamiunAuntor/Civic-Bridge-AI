const express = require("express");
const cors = require("cors");
const { corsOptionsDelegate } = require("./middleware/cors.middleware");
const { createRateLimiter } = require("./middleware/rate-limit.middleware");

const userRoutes = require("./routes/user.routes");
const caseRoutes = require("./routes/case.routes");
const assessmentRoutes = require("./routes/assessment.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const roadmapRoutes = require("./routes/roadmap.routes");
const resourceInteractionRoutes = require("./routes/resource-interaction.routes");
const simulationRoutes = require("./routes/simulation.routes");
const priorityRoutes = require("./routes/priority.routes");
const resourceRoutes = require("./routes/resource.routes");

const app = express();

app.use(cors(corsOptionsDelegate));
app.use(express.json({ limit: "250kb" }));
if (process.env.NODE_ENV === "production") {
  app.use(createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 120,
    message: "Too many requests right now. Please try again shortly.",
  }));
}

app.get("/", (_req, res) => {
  res.status(200).send("Civic Bridge API is running...");
});

app.get("/favicon.ico", (_req, res) => {
  res.status(204).end();
});

app.use("/api/users", userRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/roadmaps", roadmapRoutes);
app.use("/api/resource-interactions", resourceInteractionRoutes);
app.use("/api/simulations", simulationRoutes);
app.use("/api/priorities", priorityRoutes);
app.use("/api/resources", resourceRoutes);

module.exports = app;
