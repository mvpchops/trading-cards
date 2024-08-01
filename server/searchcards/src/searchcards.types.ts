import type * as oas from '../../../shared/api/sdk/types.js';

export type CardsRepoSearchResult = {
    total_cards: number;
    has_more: boolean;
    data: oas.Card[];
};

export type RepoSearchResult = { data: CardsRepoSearchResult; } | undefined;

export interface CardsRepository {
    search: (parameters: oas.SearchCardsQureyParams) => Promise<RepoSearchResult>;
}

export interface CardsRepositoryStrategy {
    hasRepoAPI: () => boolean;
    setRepoAPI: (api: CardsRepository) => void;
    performSearch: (parameters: oas.SearchCardsQureyParams) => Promise<RepoSearchResult>;
}