import React from 'react';
import type { CardsQueryResponse } from '../../../../shared/api/sdk/types.js';

interface FooterProps {
    results: CardsQueryResponse | undefined;
    navHandler: (navTo: string) => () => void;
}

const Footer = ({ results, navHandler }: FooterProps) => {
    const { next, previous } = results as CardsQueryResponse || {};

    return (
        <div className="bg-gray-800 p-4 text-white flex justify-between sticky bottom-0 w-full">
            {previous ? <button type="button" className="btn" onClick={navHandler(previous)}>Previous</button> : <span />}
            {next ? <button type="button" className="btn" onClick={navHandler(next)}>Next</button> : <span />}
        </div>
    );
};

export default Footer;