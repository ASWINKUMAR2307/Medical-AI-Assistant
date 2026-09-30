const { PrismaClient } = require('./src/generated/prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const bcrypt = require('bcryptjs');

const adapter = new PrismaLibSql({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function test() {
  const email = 'admin@mediassist.ai';
  const password = 'demo123';
  
  console.log('Looking up user...');
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log('User not found');
    return;
  }
  
  console.log('User found:', user.email);
  console.log('PasswordHash:', user.passwordHash);
  
  const isValid = await bcrypt.compare(password, user.passwordHash);
  console.log('Password valid:', isValid);
  
  await prisma.$disconnect();
}

test().catch(console.error);