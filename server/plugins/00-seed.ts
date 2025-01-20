import { seed } from "../db/seed";

export default defineNitroPlugin(async () => {
  if (process.env.DO_SEED === "true") {
    try {
      await seed();
      console.info("Database seeding is done.");

      process.env.DO_SEED = "false";
      console.info("DO_SEED is set to false.", process.env.DO_SEED);
    } catch (error) {
      console.error("Failed to run database seed:", error);
    }
  }
});
