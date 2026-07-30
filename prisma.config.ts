import { defineConfig } from '@prisma/config';
import { config } from 'dotenv';
config();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // DIRECT_URL bypasses PgBouncer — required for schema push/migrate
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
