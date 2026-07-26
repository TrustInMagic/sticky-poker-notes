import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Prisma CLI (migrations) needs the unpooled direct connection URL for Neon
    url: env('DIRECT_URL') || env('DATABASE_URL'),
  },
});
