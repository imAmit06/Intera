import express from "express";
import { ENV } from "./lib/env.js";
import { connectDb } from "./lib/db.js";

const app = express();

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "API is up and running" });
});

const startServer = async () => {
  try {
    await connectDb();
    app.listen(ENV.PORT, () =>
      console.log(`Server is running on port: ${ENV.PORT}`),
    );
  } catch (error) {
    console.error("❌ Error running server", error);
  }
};

startServer();
