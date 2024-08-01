import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { Config } from "../config/index.js";

const main = async () => {
	const client = postgres(Config.get().databaseUrl, { max: 1 });
	await migrate(drizzle(client), {
		migrationsFolder: "./src/drizzle/migrations",
	});

	await client.end();
};

main();
