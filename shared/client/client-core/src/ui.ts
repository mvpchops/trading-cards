import type { Card } from "../../../api/sdk/types.js";
import type { CardDisplay, FavList, FavAction } from "./types.js";

import * as api from "./api.js";
import * as store from "./store.js";

export const wait = async ({ until } = { until: 1000 }) =>
	new Promise<void>((resolve) => {
		setTimeout(() => {
			resolve();
		}, until);
	});

export const settle = (tailPromise: Promise<unknown>) => ({
	async after(headPromise: Promise<unknown>) {
		await headPromise;
		await tailPromise;
	},
});

export const capitalize = (str: string) => {
	return `${str.charAt(0).toUpperCase()}${str.substring(1)}`;
};

export const noop = () => {};

const getPageValueFromURL = (url: string) => {
	try {
		const { host, protocol } = window.location;
		const pageURL = new URL(url, `${protocol}${host}`);
		return pageURL.searchParams.get("page");
	} catch (error) {
		console.warn("unable to parse next pager URL", url);
	}
	return undefined;
};

export type PagerIndex = {
	totalPages: number;
	currentPage: number;
};

export const getPagerIndex = (
	totalResults: number,
	maxPerPage: number,
	nav: { next: string | undefined; previous: string | undefined },
): PagerIndex => {
	let currPage = 1;
	if (nav.next) {
		const nextPageValue = getPageValueFromURL(nav.next);
		if (nextPageValue) {
			currPage = Number.parseInt(nextPageValue, 10) - 1;
		}
	}

	if (nav.previous) {
		const prevPageValue = getPageValueFromURL(nav.previous);
		if (prevPageValue) {
			currPage = Number.parseInt(prevPageValue, 10) + 1;
		}
	}

	const totalPages =
		Number.parseInt(`${totalResults / maxPerPage}`) +
		(totalResults % maxPerPage === 0 ? 0 : 1);
	return { currentPage: currPage, totalPages };
};

export const resultsToCards = (raw: Card[]): CardDisplay[] => {
    const justIn: CardDisplay[] = [];

    for (const crd of raw) {
        let priceFigures: string[] = [];

        if (crd.prices) {
			const prices: string[] = Object.values(crd.prices);
            priceFigures = Object.keys(crd.prices)
                .map((currency, index) => {
                    const currencyFormat = new Intl.NumberFormat('en-US', {
                        currency,
                        style: 'currency'
                    });
                    const rawPrice = Number.parseFloat(prices[index] || '0.0');
                    return currencyFormat.format(rawPrice);
                });
        }

        const card = {
            id: crd.id,
            name: crd.name,
            games: crd.games,
            rarity: capitalize(crd.rarity),
            prices: priceFigures,
            set_name: crd.set_name,
            collector_number: `${crd.collector_number}` || 'N/A', 
            img: crd.image_uris.normal || crd.image_uris.large || 'https://placehold.co/240x335/333/ccc.webp?text=No+Image'
        };
        justIn.push(card);
    }
	store.addCards(...justIn);
    return justIn;
};

export const addOrRemoveFav = async (cardId: string, callback?: (status: FavAction) => void) => {
    const favs: FavList = JSON.parse(localStorage.getItem('favs') || '{}');
    if (cardId in favs) {
        removeFromFavs(cardId, callback);
        return;
    }
	
    const card = store.getCards().find((c) => c.id === cardId);
    if (!card) return;

	const added = await api.addCardToUsersFavs(cardId);

	if (added === true) {
		favs[cardId] = {
			name: card.name,
			when: Date.now(),
		};
		store.updateCurrentUser({favs});
		localStorage.setItem("favs", JSON.stringify(favs));
		if (!callback) return;
		callback('added');
	}
};

export const removeFromFavs = async (cardId: string, callback?: (status: FavAction) => void) => {
	const favs: FavList = JSON.parse(localStorage.getItem("favs") || "{}");
	if (Object.keys(favs).length === 0) return;
	
	const card = store.getCards().find((c) => c.id === cardId);
	if (!card) return;	
	
	const removed = await api.removeCardFromUsersFavs(cardId);
	
	if (removed) {
		delete favs[cardId];
		store.updateCurrentUser({favs});
		localStorage.setItem("favs", JSON.stringify(favs));
		if (!callback) return;
		callback('removed');
	}
};
