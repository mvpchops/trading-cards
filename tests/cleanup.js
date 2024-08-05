import { stopTestContainers } from './test-containers';

export async function cleanup() {
    console.log('Cleaning up test containers ...');
    await stopTestContainers();
    console.log('Test containers stopped & cleaned up!');
}

