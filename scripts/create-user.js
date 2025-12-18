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

createUser();

