const Database = require('better-sqlite3');

const db = new Database('./dev.db');

const user = db.prepare("SELECT * FROM User WHERE email = 'admin@mediassist.ai'").get();

console.log('User found:', !!user);
if (user) {
  console.log('Email:', user.email);
  console.log('Name:', user.name);
  console.log('Role:', user.role);
  console.log('PasswordHash:', user.passwordHash);
  console.log('IsActive:', user.isActive);
  console.log('WorkspaceId:', user.workspaceId);
  console.log('PasswordHash length:', user.passwordHash ? user.passwordHash.length : 'N/A');
  console.log('PasswordHash starts with:', user.passwordHash ? user.passwordHash.substring(0, 10) : 'N/A');
}

db.close();