const bcrypt = require('bcryptjs');

const hash = '$2b$12$IZjC/Qp5DNoKFoxcxhVx7u2T6xc6PmjW9j6Ez85BEu6rs.dkkXWH2';
const password = 'demo123';

async function check() {
  const result = await bcrypt.compare(password, hash);
  console.log('Password match:', result);
  
  // Also test what hash would be generated for demo123
  const newHash = await bcrypt.hash('demo123', 12);
  console.log('New hash for demo123:', newHash);
}
check().catch(console.error);