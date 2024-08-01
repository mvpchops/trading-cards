import type { Router } from 'express-serve-static-core';
import type { BackendService } from 'backend-core';
import { searchTradingGameCardsController } from './searchcards.controller.js';

const useRouter = (router: Router): void => {
    // const endpoint: oas.Endpoints['/search'] = '/search';
    router.get('/search', searchTradingGameCardsController);
}

export const service: BackendService = {useRouter};