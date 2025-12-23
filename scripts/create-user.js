const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createUser() {
  const email = process.argv[2];
  const password = process.argv[3];
  const role = process.argv[4] || 'USER';

  if (!email || !password) {
    console.error('Usage: node scripts/create-user.js <email> <password> [role]');
    console.error('Roles: ADMIN, USER, DELIVERY');
    process.exit(1);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role.toUpperCase(),
      },
    });

    console.log(`User created successfully:`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('Error: User with this email already exists');
    } else {
      console.error('Error creating user:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
async function createAdmin() {
  // Default admin credentials
  const email = 'admin@gmail.com';
  const password = '123';
  const name = 'Admin User';
  const role = 'ADMIN';

  try {
    console.log('🔐 Creating admin user...');
    
    const hashedPassword = await bcrypt. hash(password, 10);
    
    const user = await prisma.user. create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
      },
    });

    console.log('\n✅ Admin user created successfully! ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Role: ${user.role}`);
    console.log(`🆔 ID: ${user.id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 Use these credentials to login at:');
    console.log('   https://btobportal.vercel.app/login');
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('\n⚠️  Admin user already exists!');
      console.log('📧 Email:  admin@btobportal.com');
      console.log('🔑 Password: admin123');
    } else {
      console.error('\n❌ Error creating admin user:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
createUser();
createAdmin();

