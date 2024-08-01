// @ts-nocheck
import { init } from './init';
import { cleanup } from './cleanup';

export const mochaHooks = {
    beforeAll: async () => {
        return init();
    },
    
    afterAll: async () => {
        return cleanup(); 
    }
}


