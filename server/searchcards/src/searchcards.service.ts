import { logAs, Config } from 'backend-core';
import { backOff } from "exponential-backoff";
import { cardsRepo } from './external-cards-apis.js';
import * as errors from './searchcards.errors.js';

import type { CardsRepoSearchResult } from './searchcards.types.js';
import type * as oas from '../../../shared/api/sdk/types.js';

const log = logAs('search-cards');
const MaxScryfallAPIRetries = Config.get().cardsRepoMaxRetries;

const parseCard = (raw: oas.Card): oas.Card => {
    const {
        id, name, lang, uri, released_at, games, foil, nonfoil,
        prices, image_uris, set_name, rarity, collector_number
    } = raw;

    const parsedImgs: oas.CardImageURIs = {};
    if (image_uris?.small) parsedImgs.small = image_uris.small;
    if (image_uris?.normal) parsedImgs.normal = image_uris.normal;
    if (image_uris?.large) parsedImgs.large = image_uris.large;

    const parsedPrices: oas.CardPrices = {};
    if (prices?.usd) parsedPrices.usd = prices.usd;
    if (prices?.eur) parsedPrices.eur = prices.eur;

    const parsed: oas.Card = {
        id, name, lang,
        released_at,
        rarity, set_name,
        prices: parsedPrices,
        image_uris: parsedImgs,
        foil: foil === true,
        nonfoil: nonfoil === true,
        uri: (uri || '').substring(uri.lastIndexOf('/'))
    };

    if (games?.length) parsed.games = games;
    if (collector_number) parsed.collector_number = parseInt(`${collector_number}`, 10);

    return parsed;
};

/**
 * Search for cards using the Scryfall API
 * @param search - The search query parameters
 * @throws CardsServiceError if the search fails
 * @returns The search results
 */
export const searchForGameCards = async (
    search: oas.SearchCardsQureyParams
): Promise<CardsRepoSearchResult> => {
    let searchResult: CardsRepoSearchResult = {
        has_more: false,
        total_cards: 0,
        data: []
    };

    let cardsRepoAPIAttempts = 0;

    try {
        const backOffAndRetryOpts = {
            numOfAttempts: MaxScryfallAPIRetries,
            retry: (_e: unknown, attemptNumber: number) => {
                cardsRepoAPIAttempts = attemptNumber;
                let msg = `Calling Scryfall failed [${attemptNumber}]. Will`;
                msg += attemptNumber >= MaxScryfallAPIRetries ? ' no longer retry' : ' retry';
                log.warn(msg);
                return true;
            }
        };

        const result = await backOff(
            () => cardsRepo.performSearch(search), 
            backOffAndRetryOpts
        );
        if (cardsRepoAPIAttempts > MaxScryfallAPIRetries) {
            log.warn(errors.CARDS_REPO_UNREACHABLE_MSG);
            throw new errors.CardsServiceError(errors.CARDS_REPO_UNREACHABLE_MSG);
        }

        log.info(`retrieved cards for term: ${search.term}`);
        if (result) {
            searchResult = result.data;
            if (searchResult.data && Array.isArray(searchResult.data)) {
                searchResult.data = searchResult.data.map((card) => parseCard(card));
            }
        }
    } catch (err) {
        const error = err as Error;
        const msg = error.message || errors.CARD_SEARCH_FAILED_MSG;
        log.error(error);
        throw new errors.CardsServiceError(msg, error);
    }

    return searchResult;
}
