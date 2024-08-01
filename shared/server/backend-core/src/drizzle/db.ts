import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { Config } from "../config/index.js";
import * as schema from "./schema.js";

let client: postgres.Sql | undefined = undefined;

export const db = () => {
    if (!client) {
        client = postgres(Config.get({latest: true}).databaseUrl);
        return drizzle(client, { schema });
    }
    return drizzle(client, { schema });
};
export * as schema from "./schema.js";
