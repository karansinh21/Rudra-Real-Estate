const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS "areaUnit" TEXT DEFAULT 'sqft'`);
    console.log('1. areaUnit - done');
    await prisma.$executeRawUnsafe(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS "soilType" TEXT`);
    console.log('2. soilType - done');
    await prisma.$executeRawUnsafe(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS "waterSource" TEXT`);
    console.log('3. waterSource - done');
    await prisma.$executeRawUnsafe(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS "roadAccess" TEXT`);
    console.log('4. roadAccess - done');
    await prisma.$executeRawUnsafe(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS "naPermission" BOOLEAN DEFAULT false`);
    console.log('5. naPermission - done');
    await prisma.$executeRawUnsafe(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS "clearTitle" BOOLEAN DEFAULT false`);
    console.log('6. clearTitle - done');
    await prisma.$executeRawUnsafe(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS "approvedLayout" BOOLEAN DEFAULT false`);
    console.log('7. approvedLayout - done');
    console.log('\nAll done!');
  } catch (e) {
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();