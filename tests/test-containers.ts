import { Wait } from 'testcontainers';
import { RedisContainer } from '@testcontainers/redis';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedTestContainer } from 'testcontainers';

const containers: StartedTestContainer[] = [];    

const startDBContainer = () => {

    return new PostgreSqlContainer('postgres:16.3-alpine')
        .withEnvironment({
            'POSTGRES_USER': 'test',
            'POSTGRES_PASSWORD': 'test'
        })
        .withHealthCheck({
            test: [ "CMD", "pg_isready" ],
            interval: 10000,
            timeout: 5000,
            retries: 5,
        })
        .withWaitStrategy(Wait.forHealthCheck())
        .withCopyFilesToContainer([{
            source: './tests/testdb.init.sql',
            target: '/docker-entrypoint-initdb.d/init.sql'
        }])
        .withLogConsumer((stream) => {
            stream.on("data", line => {
                if (line.includes('docker-entrypoint-initdb')) {
                    console.log('[DB Container] ', line);
                }
            });
            stream.on("err", line => console.error('[DB Container] ', line));
            stream.on("end", () => console.log("[DB Container] Stream closed"));
        })
        .withExposedPorts(5432);
};

const startCacheContainer = () => {
    return new RedisContainer('redis:7.2-alpine')
        .withHealthCheck({
            test: [ "CMD", "redis-cli", "ping" ],
            interval: 10000,
            timeout: 5000,
            retries: 5,
        })
        .withWaitStrategy(Wait.forHealthCheck())
        .withExposedPorts(6379);   
};

export async function startTestContainers() {

    const [dbContainer, cacheContainer] = await Promise.all([
        startDBContainer().start(),
        startCacheContainer().start()
    ]);

    const dbURL = dbContainer.getConnectionUri();
    const cacheURL = cacheContainer.getConnectionUrl();

    containers.push(cacheContainer, dbContainer);

    return { dbURL, cacheURL };
}

export async function stopTestContainers() {
    await Promise.all(containers.map(container => container.stop()));
}


