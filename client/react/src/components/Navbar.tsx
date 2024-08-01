import React from 'react';

interface NavbarProps {
    submitHandler: (event: React.FormEvent) => void;
    inputHandler: (value: string) => void;
    userIsAuthenticated: boolean;
    showFavs: () => void;
    showAuth: () => void;
}

const Navbar = ({ submitHandler, inputHandler, showFavs, showAuth, userIsAuthenticated }: NavbarProps) => {
    return (
        <nav className="bg-gray-800 p-4 flex justify-between items-center">
            <form onSubmit={submitHandler} className="flex-1">
                <input 
                    type="text" 
                    className="flex-1 rounded-l" 
                    placeholder="try pokey, bird ..."
                    onChange={(e) => inputHandler(e.target.value)} 
                />
                <button type="submit" className="bg-blue-500 text-white rounded-r px-4">
                    Search
                </button>
            </form>
            <div className="flex space-x-4">
                {!userIsAuthenticated ?
                    <button type="button" className="text-white" onClick={showAuth}>
                        Login / Sign Up
                    </button>
                    : 
                    <button type="button" className="text-white" onClick={showFavs}>
                        My Favs
                    </button>
                }
            </div>
        </nav>
    );
};

export default Navbar;