import { stopTestContainers } from './test-containers';

export async function cleanup() {
    await stopTestContainers();
    console.log('Test containers stopped & cleaned up!');
}

