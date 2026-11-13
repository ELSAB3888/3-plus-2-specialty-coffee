import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fixed absolute path to admin-server/.env regardless of process.cwd()
const adminEnvPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(adminEnvPath)) {
  dotenv.config({ path: adminEnvPath });
} else {
  // Fallback to default cwd .env if admin-server/.env is absent
  dotenv.config();
}

export default process.env;
