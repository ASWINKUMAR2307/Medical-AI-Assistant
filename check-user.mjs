import { PrismaClient } from './src/generated/prisma/client.js';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function check() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@mediassist.ai' } });
  console.log('User found:', !!user);
  if (user) {
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Role:', user.role);
    console.log('PasswordHash:', user.passwordHash);
    console.log('IsActive:', user.isActive);
    console.log('WorkspaceId:', user.workspaceId);
  }
  await prisma.$disconnect();
}
check().catch(console.error);