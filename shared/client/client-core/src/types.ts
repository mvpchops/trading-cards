import type { Card } from "../../../api/sdk/types.js";

export type CardInfo = 'id' | 'name' | 'set_name' | 'rarity';
export type CardDisplay = Pick<Card, CardInfo> & {
    img: string;
    prices: string[];
    games: string[] | undefined;
    collector_number: string | undefined;
};

export type Fav = {
    name: string;
    when: number;
};

export type FavAction = 'added' | 'removed';

export type FavList = {
    [key: string]: Fav | undefined;
};

export type AppUser = {
    favs: FavList;
    id?: string | undefined;
    authToken: string | undefined;
    isAuthenticated: boolean | false;
};

export type AppState = {
    readonly cards: CardDisplay[];
    readonly currentUser: AppUser;
};