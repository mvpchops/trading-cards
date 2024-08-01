import axios from 'axios';
import { logAs, Config } from 'backend-core';
import type * as oas from '../../../shared/api/sdk/types.js';
import type { 
    CardsRepository, CardsRepositoryStrategy,
    RepoSearchResult
} from './searchcards.types.js';

const log = logAs('search-cards');

const CardsRepoAPI = Config.get().cardsRepoAPI;
const ScryfallAPIBase = Config.get().scryfallApiBase;

class ScryfallCardsRep implements CardsRepository {
    private apiBase: string;
    public constructor(apiBase: string) {
        this.apiBase = apiBase;
    }

    async search(parameters: oas.SearchCardsQureyParams): Promise<RepoSearchResult> {
        const {term, orderby, sortdir, page = 1} = parameters;
        const sortDir = `${sortdir} || 'AUTO'`.toLowerCase();
        const orderBy = `${orderby} || 'name'`.toLowerCase();

        let searchEndpoint = `${this.apiBase}/cards/search`;
        searchEndpoint = `${searchEndpoint}?q=${term}&order=${orderBy}&dir=${sortDir}&page=${page}`;

        return axios.get(searchEndpoint);
    }
}

class GameCardsRepository implements CardsRepositoryStrategy {
    private repoAPI: CardsRepository | undefined = undefined;
    setRepoAPI(api: CardsRepository) {
        this.repoAPI = api;
    }

    hasRepoAPI() {
        return this.repoAPI !== undefined;
    }

    async performSearch(parameters: oas.SearchCardsQureyParams): Promise<RepoSearchResult> {
        if (!this.repoAPI) return undefined;

        return this.repoAPI.search(parameters);
    }
}

export const cardsRepo = new GameCardsRepository();
if (!CardsRepoAPI) {
    log.warn('CardsRepoAPI ENV is not set/reachable. Expect errors ...');
}

if (CardsRepoAPI === 'Scryfall') {
    if (ScryfallAPIBase) {
        const scryfallRepo = new ScryfallCardsRep(ScryfallAPIBase);
        cardsRepo.setRepoAPI(scryfallRepo);
    } else {
        log.warn('ScryfallAPI ENV is not set/reachable. Expect errors ...');
    }
}

if (!cardsRepo.hasRepoAPI()) {
    log.warn('Cards repo API is not configured. Expect errors ...');
}