import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { env } from './env';

// 1. Create a standard Postgres connection pool
const pool = new pg.Pool({ connectionString: env.DATABASE_URL });

// 2. Wrap it in the Prisma Adapter
const adapter = new PrismaPg(pool);

// 3. Instantiate the Client using the adapter
export const prisma = new PrismaClient({ adapter });