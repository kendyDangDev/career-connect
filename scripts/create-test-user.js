const { PrismaClient } = require('../src/generated/prisma');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Hash mật khẩu test
    const password = 'SecurePassword123!'; // Mật khẩu test đơn giản
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Tạo user test
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        userType: 'CANDIDATE',
        emailVerified: true,
        status: 'ACTIVE',
      },
    });

    // Tạo profile cho user
    await prisma.userProfile.create({
      data: {
        userId: user.id,
      },
    });

    // Tạo candidate record
    await prisma.candidate.create({
      data: {
        userId: user.id,
      },
    });

    console.log('Test user created successfully:', {
      email: 'test@example.com',
      password: 'SecurePassword123!',
      id: user.id,
    });

    // Tạo user employer test
    const employerPassword = 'SecurePassword123!';
    const hashedEmployerPassword = await bcryptjs.hash(employerPassword, 12);

    const employer = await prisma.user.create({
      data: {
        email: 'employer@example.com',
        passwordHash: hashedEmployerPassword,
        firstName: 'Employer',
        lastName: 'Test',
        userType: 'EMPLOYER',
        emailVerified: true,
        status: 'ACTIVE',
      },
    });

    // Tạo profile cho employer
    await prisma.userProfile.create({
      data: {
        userId: employer.id,
      },
    });

    console.log('Test employer created successfully:', {
      email: 'employer@example.com',
      password: 'SecurePassword123!',
      id: employer.id,
    });

    // Tạo user admin test
    const adminPassword = 'SecurePassword123!';
    const hashedAdminPassword = await bcryptjs.hash(adminPassword, 12);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        passwordHash: hashedEmployerPassword,
        firstName: 'Admin',
        lastName: 'Test',
        userType: 'ADMIN',
        emailVerified: true,
        status: 'ACTIVE',
      },
    });

    // Tạo profile cho employer
    await prisma.userProfile.create({
      data: {
        userId: admin.id,
      },
    });

    console.log('Test admin created successfully:', {
      email: 'admin@example.com',
      password: 'SecurePassword123!',
      id: employer.id,
    });
  } catch (error) {
    console.error('Error creating test user:', error);

    if (error.code === 'P2002') {
      console.log('User với email này đã tồn tại. Kiểm tra lại database.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
