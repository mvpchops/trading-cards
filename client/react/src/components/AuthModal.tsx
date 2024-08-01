import React, { useState } from 'react';
import { api } from 'client-core';

interface AuthModalProps {
    show: boolean;
    onHide: () => void;
    authenticate: (isAuthenticated: boolean) => void;
}

const AuthModal = ({ show, onHide, authenticate }: AuthModalProps) => {
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [createUser, setCreateUser] = useState(true);
    const [error, setError] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const { isAuthenticated } = await api.authenticateUser(nickname, password, createUser);
            authenticate(isAuthenticated);
            onHide();
        } catch (e) {
            setError('Authentication failed');
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-md w-full max-w-md">
                <div className="px-4 py-2 border-b flex justify-between items-center">
                    <h5 className="text-lg font-semibold">Sign Up / Login</h5>
                    <button type="button" className="text-gray-400 hover:text-gray-600" onClick={onHide}>&times;</button>
                </div>
                <div className="p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="nickname" className="form-label">Nickname</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                id="nickname" 
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input 
                                type="password" 
                                className="form-control" 
                                id="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="form-check mb-3">
                            <input 
                                type="checkbox" 
                                className="form-check-input" 
                                id="createUser" 
                                checked={createUser} 
                                onChange={() => setCreateUser(!createUser)} 
                            />
                            <label htmlFor="createUser" className="form-check-label">
                                Create my account to sign me up
                            </label>
                        </div>
                        {error && <p className="text-red-500">{error}</p>}
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;