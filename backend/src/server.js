import express from "express";
import { ENV } from "./lib/env.js";
import { connectDb } from "./lib/db.js";
import { serve } from "inngest/express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));

app.use("/api/inngest", serve({ client: inngest, functions }));

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
