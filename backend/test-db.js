import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Connected successfully!');

    console.log('Testing query...');
    const users = await prisma.user.findMany({ take: 1 });
    console.log('Found users:', users.length);

    await prisma.$disconnect();
    console.log('Test complete!');
  } catch (err) {
    console.error('ERROR:', err.message);
    console.error('CODE:', err.code);
    if (err.meta) console.error('META:', JSON.stringify(err.meta, null, 2));
    process.exit(1);
  }
}

test();
