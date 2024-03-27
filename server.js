require("dotenv").config();
const express = require("express");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const resourcesRouter = require("./routes/resources");
const mailRouter = require("./routes/mails");
const postsRouter = require("./routes/posts");
const commentsRouter = require("./routes/comments");
const materialsRouter = require("./routes/materials");
const userRouter = require("./routes/users");
const roleRouter = require("./routes/roles");
const { sequelize } = require("./config/database");

/*TODO: 
-SETUP firebase SDK
*/
const app = express();
app.use(express.json());

const corsOptions = {
  origin: 'https://localhost:5173',
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use("/api", resourcesRouter);
app.use("/api", mailRouter);
app.use("/api", postsRouter);
app.use("/api", commentsRouter);
app.use("/api", materialsRouter);
app.use("/api", userRouter);
app.use("/api", roleRouter);

app.get("/", (req, res) => {
  const baseUrl = req.protocol + "://" + req.get("host");
  res.json({
    documentation: baseUrl + "/api/docs",
    resources: baseUrl + "/api/resources",
    posts: baseUrl + "/api/posts",
    materials: baseUrl + "/api/materials",
    users: baseUrl + "/api/users",
    roles: baseUrl + "/api/roles",
  });
});

sequelize.sync().then(() => {
  console.log("Database synced successfully.");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
