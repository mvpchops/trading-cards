import { logAs } from 'backend-core';
import * as service from './searchcards.service.js';
import type * as oas from '../../../shared/api/sdk/types.js';

const log = logAs('search-cards');

export const searchTradingGameCardsController: oas.SearchCardsHandler = async (
    request,
    response,
): Promise<void> => {
    const queryParams = request.query;
    log.info(`attempt to retrieve cards with: ${request.originalUrl}`);
    try {
        const { data: cards, has_more, total_cards } = await service.searchForGameCards(queryParams);
        const output: oas.CardsQueryResponse = {
            total: total_cards,
            data: cards
        };

        const pagination = paginate(request.originalUrl, has_more, queryParams);

        response.json({...output, ...pagination});
    } catch (err) {
        const error = err as Error;
        log.error(error);
        response.status(500).json({message: error.message});
    }
};

const setPageParam = (url:string, value: number) => {
    return url.indexOf('page=') === -1 
        ? `${url}&page=${value}`
        : `${url}`.replace(/page=\d+/, `page=${value}`)
}

const setSortDirParam = (url:string, value: string) => {
    return url.indexOf('sortdir=') === -1 
        ? `${url}&sortdir=${value.toUpperCase()}`
        : url
}

const setOrderByParam = (url:string, value: string) => {
    return url.indexOf('orderby=') === -1 
        ? `${url}&orderby=${value}`
        : url
}

const paginate = (requestUrl: string, hasMore: boolean, queryParams: oas.SearchCardsQureyParams): oas.Pagination => {
    const nav: oas.Pagination = {};
    const {page = 1, sortdir = 'ASC', orderby = 'name'} = queryParams;
    let url = requestUrl.substring(requestUrl.indexOf('/search'));

    url = setSortDirParam(url, sortdir);
    url = setOrderByParam(url, orderby);

    if (page >= 2 || hasMore === true) {
        if (page >= 2) {
            nav.previous = setPageParam(url, page - 1);
        }
    
        if (hasMore === true) {
            nav.next = setPageParam(url, page + 1);
        }
    }

    return nav as oas.Pagination;
}