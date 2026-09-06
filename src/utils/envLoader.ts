import path from 'path';
import dotenv from 'dotenv';

// Load env variables from a file relative to the project root.
export function loadEnvFile(fileName: string): void {
    dotenv.config({ path: path.resolve(process.cwd(), fileName) });
}
