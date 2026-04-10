import path from "path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, "prisma", "schema.prisma"),

  migrate: {
    adapter: async () => {
      const { PrismaSQLite } = await import("@prisma/adapter-sqlite-better");
      return new PrismaSQLite({ url: "file:./prisma/dev.db" });
    }
  }
});
