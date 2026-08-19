import fs from 'fs';
import path from 'path';
import { parseEnvFile } from '../src/commands/sync';

console.log('Running Sync & Env Parser Unit Tests...');

const testEnvContent = `
# Sample comment
PORT=3000
DB_HOST="localhost:5432"
API_KEY='secret 123'
EMPTY=
`;

const tempFilePath = path.join(__dirname, 'test.env');
fs.writeFileSync(tempFilePath, testEnvContent);

const parsed = parseEnvFile(tempFilePath);
fs.unlinkSync(tempFilePath);

if (parsed['PORT'] !== '3000') {
  console.error('❌ Failed to parse plain number');
  process.exit(1);
}
if (parsed['DB_HOST'] !== 'localhost:5432') {
  console.error('❌ Failed to unquote double quotes');
  process.exit(1);
}
if (parsed['API_KEY'] !== 'secret 123') {
  console.error('❌ Failed to unquote single quotes');
  process.exit(1);
}
if (parsed['EMPTY'] !== '') {
  console.error('❌ Failed to parse empty value');
  process.exit(1);
}

console.log('✅ All Sync & Env Parser Unit Tests Passed!');
