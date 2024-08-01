import React, { useState, useEffect, useCallback } from 'react';

import Navbar from './Navbar';
import ResultsView from './ResultsView';
import FavoritesModal from './FavoritesModal';
import AuthModal from './AuthModal';
import Footer from './Footer';

import { api } from 'client-core';

import type { FavList } from 'client-core';
import type { CardsQueryResponse } from '../../../../shared/api/sdk/types.js';

const App = (): JSX.Element => {
    const [term, setTerm] = useState<string | null>(null);
    const [query, setQuery] = useState<string | null>(null);
    const [results, setResults] = useState<CardsQueryResponse | undefined>();
    const [userIsAuthenticated, setUserIsAuthenticated] = useState<boolean>(false);
    const [favs, setFavs] = useState<FavList>({});
    const [showFavsModal, setShowFavsModal] = useState<boolean>(false);
    const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

    const validationPtrn = /^\w{3,}$/;

    const handleSubmission = (event: React.FormEvent) => {
        event.preventDefault();
        if (validationPtrn.test(term || '') !== true) return;
        setQuery(term);
    };

    const handleNav = (navTo: string) => async () => {
        if (!query) return;
        try {
            await api.performSearch(query, setResults, navTo);
        } catch (e) {
            console.warn(e);
        }
    };

    useEffect(() => {
        if (!query) return;
        const fetchResults = async () => {
            try {
                await api.performSearch(query, setResults);
            } catch (e) {
                console.warn(e);
            }
        };
        fetchResults();
    }, [query]);

    const checkIfAuthenticated = useCallback(async () => {
        try {
            const user = await api.fetchCurrentUserData();
            const { isAuthenticated } = user || {};
            setUserIsAuthenticated(isAuthenticated ?? false);
        } catch (error) {
            console.warn('fetch user data failed', error);
        }
    }, []);

    useEffect(() => {
        checkIfAuthenticated();
    }, [checkIfAuthenticated]);

    return (
        <div className='flex flex-col min-h-screen'>
            <Navbar 
                submitHandler={handleSubmission} 
                inputHandler={setTerm} 
                userIsAuthenticated={userIsAuthenticated}
                showFavs={() => setShowFavsModal(true)}
                showAuth={() => setShowAuthModal(true)}
            />
            <div className="flex-grow">
                <ResultsView 
                    setFavs={setFavs}
                    searchResults={results} 
                    userIsAuthenticated={userIsAuthenticated}
                    onAuthRequired={() => setShowAuthModal(true)}
                />
            </div>
            <FavoritesModal show={showFavsModal} onHide={() => setShowFavsModal(false)} favorites={favs} />
            <AuthModal show={showAuthModal} onHide={() => setShowAuthModal(false)} authenticate={setUserIsAuthenticated} />
            <Footer results={results} navHandler={handleNav} />
        </div>
    );
};

export default App;