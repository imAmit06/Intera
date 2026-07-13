import express from "express";
import { ENV } from "./lib/env.js";
import { connectDb } from "./lib/db.js";
import { serve } from "inngest/express";
import { inngest, functions } from "./lib/inngest.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import { protectRoute } from "./middleware/protectRoute.js";
import chatRoutes from "./routes/chatRoutes.js";
import pistonRoutes from "./routes/pistonRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";

const app = express();

app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(clerkMiddleware());

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/piston", pistonRoutes);
app.use("/api/sessions", sessionRoutes);

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
