import { seed } from "../db/seed";

export default defineNitroPlugin(async () => {
  if (process.env.DO_SEED === "true") {
    try {
      await seed();
      console.info("Database seeding is done.");
    } catch (error) {
      console.error("Failed to run database seed:", error);
    }
  }
});
