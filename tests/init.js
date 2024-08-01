// @ts-nocheck
import fs from 'node:fs';
import path from 'node:path';
import Dotenv from 'dotenv';
import { startTestContainers } from './test-containers';

export async function init() {
    try {
        console.log('Initializing test containers ...');

        const pathToEnvFile = path.resolve(__dirname, '../', '.env.test.local');
        const envFileContent = fs.readFileSync(pathToEnvFile, 'utf-8');
        const envVariables = Dotenv.parse(envFileContent);

        const { dbURL, cacheURL } = await startTestContainers(process.env.APP_NAME);

        for (const [key, value] of Object.entries(envVariables)) {
            process.env[key] = value;
            if (key.startsWith('DATABASE_URL')) {
                process.env.DATABASE_URL = dbURL;
            }
            if (key.startsWith('CACHE_URL')) {
                process.env.CACHE_URL = cacheURL;
            }

            if (key.startsWith('NODE_ENV')) {
                process.env.NODE_ENV = 'test';
            }
        }

        const updatedEnvVariables = Object.keys(envVariables)
        .map(key => `${key}="${process.env[key]}"`).join('\n');

        // Update.env.test.local file
        fs.writeFileSync(pathToEnvFile, updatedEnvVariables, { encoding: 'utf-8', flag: 'w' });
        console.log('Test containers are now ready!\n\n');
    } catch (err) {
        console.error('Failed to initialize test environment', err);
        process.exit(1);
    }
}
