const { getEnv } = require("./config/env");
const { connectDB } = require("./config/db");
const { createApp } = require("./app");

async function start() {
  const env = getEnv();
  await connectDB(env.MONGODB_URI);
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`KaziLink API listening on port ${env.PORT}`);
  });

  const shutdown = (signal) => {
    server.close(async (error) => {
      if (error) {
        console.error(error);
        process.exitCode = 1;
      }
      const mongoose = require("mongoose");
      await mongoose.disconnect();
      console.log(`Closed after ${signal}.`);
    });
  };
  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((error) => {
  console.error(`KaziLink API startup failed: ${error.message}`);
  process.exitCode = 1;
});
