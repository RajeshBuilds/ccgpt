import { config } from "dotenv";
import { drizzle } from 'drizzle-orm/neon-http';

config({ path: ".env" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not set. Please add it to your .env file.\n' +
    'For Neon database, it should look like: postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require'
  );
}

export const db = drizzle(databaseUrl);
