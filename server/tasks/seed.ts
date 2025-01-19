import { seed } from "../db/seed";

export default defineTask({
  meta: {
    name: "db:seed",
  },
  async run() {
    try {
      await seed();

      return {
        result: "success ✅",
        message: "Database seeded successfully",
      };
    } catch (error) {
      console.error(error);

      return {
        result: "error ❌",
        message: "Failed to seed database",
      };
    }
  },
});
