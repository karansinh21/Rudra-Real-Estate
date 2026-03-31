const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  try {
    // ✅ Clean database first
    console.log('🧹 Cleaning existing data...');
    await prisma.enquiry.deleteMany({});
    await prisma.property.deleteMany({});
    await prisma.landRequirement.deleteMany({});
    await prisma.legalRequest.deleteMany({});
    await prisma.legalService.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✅ Database cleaned\n');

    // ✅ Create Users
    console.log('👥 Creating users...');
    
    const adminPassword = await bcrypt.hash('rudra123', 10);
    const admin = await prisma.user.create({
  data: {
    name: 'JAYRAJSINH PADHIYAR',
    email: 'rudrarealestate001@gmail.com',
    password: adminPassword,
    phone: '9316040778',
    role: 'ADMIN'
  }
});

console.log('✅ Admin created:', admin.email);

    const brokerPassword = await bcrypt.hash('broker123', 10);
    const broker = await prisma.user.create({
      data: {
        name: 'Rajesh Broker',
        email: 'broker@rudra.com',
        password: brokerPassword,
        phone: '9876543211',
        role: 'BROKER'
      }
    });
    console.log('✅ Broker created:', broker.email);
    console.log('   ID:', broker.id);

    const lawyerPassword = await bcrypt.hash('lawyer123', 10);
    const lawyer = await prisma.user.create({
      data: {
        name: 'Advocate Sharma',
        email: 'lawyer@rudra.com',
        password: lawyerPassword,
        phone: '9876543212',
        role: 'LAWYER'
      }
    });
    console.log('✅ Lawyer created:', lawyer.email);
    console.log('   ID:', lawyer.id, '\n');

    // ✅ Wait a bit to ensure transaction is committed
    await new Promise(resolve => setTimeout(resolve, 1000));

    // ✅ Verify broker exists
    const brokerCheck = await prisma.user.findUnique({
      where: { id: broker.id }
    });
    
    if (!brokerCheck) {
      throw new Error('Broker not found after creation!');
    }
    console.log('✅ Broker verified in database\n');

    // ✅ Create Properties
    console.log('🏠 Creating properties...');

    const property1 = await prisma.property.create({
      data: {
        title: 'Luxurious 3BHK Apartment in Alkapuri',
        description: 'Beautiful spacious apartment with modern amenities, prime location',
        type: 'RESIDENTIAL',
        purpose: 'SALE',
        price: 8500000,
        area: 1450,
        bedrooms: 3,
        bathrooms: 2,
        address: 'Alkapuri Main Road, Near Garden',
        city: 'Vadodara',
        state: 'Gujarat',
        pincode: '390007',
        features: ['Parking', 'Lift', '24/7 Security', 'Garden', 'Power Backup'],
        images: [],
        status: 'AVAILABLE',
        broker: {
          connect: { id: broker.id }
        }
      }
    });
    console.log('✅ Property 1:', property1.title);

    const property2 = await prisma.property.create({
      data: {
        title: 'Prime Commercial Shop in Sayajigunj',
        description: 'Ideal for retail business, high footfall area',
        type: 'COMMERCIAL',
        purpose: 'RENT',
        price: 50000,
        area: 800,
        address: 'Sayajigunj Market, Near Railway Station',
        city: 'Vadodara',
        state: 'Gujarat',
        pincode: '390005',
        features: ['AC', 'Parking', 'Main Road', 'High Footfall'],
        images: [],
        status: 'AVAILABLE',
        broker: {
          connect: { id: broker.id }
        }
      }
    });
    console.log('✅ Property 2:', property2.title);

    const property3 = await prisma.property.create({
      data: {
        title: 'Agricultural Land in Karjan',
        description: 'Fertile agricultural land near highway',
        type: 'LAND',
        purpose: 'SALE',
        price: 2500000,
        area: 5000,
        address: 'Karjan Highway Road',
        city: 'Karjan',
        state: 'Gujarat',
        pincode: '391240',
        features: ['Water Supply', 'Electricity', 'Road Access', 'Fertile Soil'],
        images: [],
        status: 'AVAILABLE',
        broker: {
          connect: { id: broker.id }
        }
      }
    });
    console.log('✅ Property 3:', property3.title, '\n');

    // ✅ Create Land Requirements
    console.log('🌾 Creating land requirements...');

    const landReq1 = await prisma.landRequirement.create({
      data: {
        name: 'Ramesh Patel',
        email: 'ramesh@gmail.com',
        phone: '9876543220',
        purposeType: 'Agricultural',
        landType: 'AGRICULTURAL',
        minArea: 5000,
        maxArea: 10000,
        areaUnit: 'sq.ft',
        preferredLocations: ['Karjan', 'Dabhoi', 'Padra'],
        city: 'Vadodara',
        state: 'Gujarat',
        minBudget: 2000000,
        maxBudget: 5000000,
        features: ['Water Supply', 'Electricity', 'Road Access'],
        timeline: 'Within 3 months',
        additionalNotes: 'Looking for fertile land for organic farming',
        status: 'ACTIVE'
      }
    });
    console.log('✅ Land Requirement 1:', landReq1.name);

    const landReq2 = await prisma.landRequirement.create({
      data: {
        name: 'Suresh Shah',
        email: 'suresh@business.com',
        phone: '9876543221',
        purposeType: 'Commercial Development',
        landType: 'COMMERCIAL',
        minArea: 2000,
        maxArea: 5000,
        areaUnit: 'sq.ft',
        preferredLocations: ['Sayajigunj', 'Alkapuri', 'RC Dutt Road'],
        city: 'Vadodara',
        state: 'Gujarat',
        minBudget: 10000000,
        maxBudget: 20000000,
        features: ['Main Road', 'Corner Plot', 'Commercial Zone'],
        timeline: 'Within 6 months',
        additionalNotes: 'Want to build shopping complex',
        status: 'ACTIVE'
      }
    });
    console.log('✅ Land Requirement 2:', landReq2.name, '\n');

    // ✅ Summary
    console.log('═══════════════════════════════════════');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════');
    console.log('📊 Database Summary:');
    console.log('   👥 Users: 3');
    console.log('   🏠 Properties: 3');
    console.log('   🌾 Land Requirements: 2');
    console.log('═══════════════════════════════════════\n');

    console.log('🔑 Login Credentials:');
console.log('   Admin:  rudrarealestate001@gmail.com / rudra123');
console.log('   Broker: broker@rudra.com / broker123');
console.log('   Lawyer: lawyer@rudra.com / lawyer123');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Seeding failed!');
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Code:', error.code);
    }
    if (error.meta) {
      console.error('Meta:', JSON.stringify(error.meta, null, 2));
    }
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('\n❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Database disconnected\n');
  });