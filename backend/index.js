import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRoutes from "./routes/user.route.js";
import promtRoutes from "./routes/promt.route.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 6001;
const MONGO_URL = process.env.MONGO_URI;

// middleware
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = process.env.FRONTEND_URLS.split(",") || [];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);



// DB Connection Code Goes Here!!!!
mongoose
  .connect(`${MONGO_URL}/InfoSeek`)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB Connection Error: ", error));


// routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/infoseek", promtRoutes);


app.get("/" , (req, res) => {
  res.send("Hello world")
})


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;