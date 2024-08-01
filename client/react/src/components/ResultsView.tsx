import React from 'react';
import Card from './Card';
import { ui, store } from 'client-core';

import type { FavList } from 'client-core';
import type { CardsQueryResponse } from '../../../../shared/api/sdk/types.js';

interface ResultsViewProps {
    searchResults: CardsQueryResponse | undefined;
    userIsAuthenticated: boolean;
    setFavs: (favs: FavList) => void;
    onAuthRequired: () => void;
}

const ResultsView = ({ searchResults, userIsAuthenticated, onAuthRequired, setFavs }: ResultsViewProps) => {
    if (!searchResults) {
        return (
            <div className="container mx-auto mt-10 px-4 flex-grow">
                <blockquote className="blockquote">
                    <p className="lead">Our collection is massive!</p>
                    <p className="lead">You are welcome to <span className="text-bg-warning p-1">search</span>
                        for your favourite trading game card and see for yourself</p>
                </blockquote>
            </div>
        );
    }
        

    const { data } = searchResults as CardsQueryResponse || {};
    const cards = ui.resultsToCards(data);
    const favs = store.getFavorites();
    return (
        <div className="container mx-auto mt-10 px-4 flex-grow">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {cards.map((card) => (
                    <Card 
                        key={card.id} 
                        card={card} 
                        isFav={card.id in favs}
                        setFavs={setFavs}
                        userIsAuthenticated={userIsAuthenticated} onAuthRequired={onAuthRequired} />
                ))}
            </div>
        </div>
    );
};

export default ResultsView;