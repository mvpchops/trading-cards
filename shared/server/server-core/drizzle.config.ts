import { defineConfig } from 'drizzle-kit';
import { Config } from './src/config/index';

console.log(
    'Drizzle DB Is',
    Config.get().databaseUrl.substring(Config.get().databaseUrl.indexOf('@') + 1)
);

export default defineConfig({
    schema: './src/drizzle/schema.ts',
    out: './src/drizzle/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: Config.get().databaseUrl
    },
    strict: true,
    verbose: true
});