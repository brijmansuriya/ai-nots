import { useState, useEffect } from 'react';
import { ENV } from '../config/env';
import { authService, type LoginData, type RegisterData } from '../services/authService';
import './AuthSetup.css';

interface AuthStatus {
    isAuthenticated: boolean;
    user?: {
        name: string;
        email: string;
    };
}

interface AuthSetupProps {
    onAuthenticated: () => void;
}

const AuthSetup = ({ onAuthenticated }: AuthSetupProps) => {
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [authStatus, setAuthStatus] = useState<AuthStatus>({ isAuthenticated: false });
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showRegisterPasswordConfirm, setShowRegisterPasswordConfirm] = useState(false);

    useEffect(() => {
        // Ensure base URL is set
        chrome.storage.local.get(['apiBaseUrl'], (result: { [key: string]: any }) => {
            if (!result.apiBaseUrl) {
                // Save default URL
                chrome.storage.local.set({ apiBaseUrl: ENV.API_BASE_URL });
            }
        });

        // Check for existing API token auth
        checkApiAuth();
    }, []);

    const checkApiAuth = async () => {
        try {
            setCheckingAuth(true);
            const isAuth = await authService.isAuthenticated();
            
            if (isAuth) {
                const user = await authService.getUser();
                setAuthStatus({
                    isAuthenticated: true,
                    user: user ? { name: user.name, email: user.email } : undefined,
                });
                setTimeout(() => {
                    onAuthenticated();
                }, 500);
            } else {
                setAuthStatus({ isAuthenticated: false });
            }
        } catch (error) {
            setAuthStatus({ isAuthenticated: false });
        } finally {
            setCheckingAuth(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setMessage(null);

            const response = await authService.login(loginData as LoginData);

            setMessage({ type: 'success', text: response.message || 'Login successful!' });
            setShowLogin(false);
            setLoginData({ email: '', password: '' });
            
            setAuthStatus({
                isAuthenticated: true,
                user: { name: response.user.name, email: response.user.email },
            });
            
            setTimeout(() => {
                onAuthenticated();
            }, 1000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Login failed',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setMessage(null);

            const response = await authService.register(registerData as RegisterData);

            setMessage({ type: 'success', text: response.message || 'Registration successful!' });
            setShowRegister(false);
            setRegisterData({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
            });
            
            setAuthStatus({
                isAuthenticated: true,
                user: { name: response.user.name, email: response.user.email },
            });
            
            setTimeout(() => {
                onAuthenticated();
            }, 1000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Registration failed',
            });
        } finally {
            setLoading(false);
        }
    };


    // If authenticated, don't show this component (parent will show dashboard)
    if (authStatus.isAuthenticated) {
        return null;
    }

    return (
        <div className="auth-setup">
            <div className="auth-setup-header">
                <h2>AI Notes Extension</h2>
                <p className="auth-setup-subtitle">
                    Login to start saving prompts
                </p>
            </div>

            {/* Authentication Status */}
            {checkingAuth ? (
                <div className="auth-setup-status checking">Checking authentication...</div>
            ) : (
                <div className="auth-setup-status not-authenticated">
                    <span>Please login to continue</span>
                </div>
            )}

            {/* Login Form */}
            {showLogin && !showRegister && (
                <form onSubmit={handleLogin} className="auth-setup-login-form">
                    <div className="auth-setup-field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={loginData.email}
                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                            placeholder="email@example.com"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="auth-setup-field">
                        <label htmlFor="password">Password</label>
                        <div className="auth-setup-password-wrapper">
                            <input
                                id="password"
                                type={showLoginPassword ? 'text' : 'password'}
                                value={loginData.password}
                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                placeholder="••••••••"
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="auth-setup-password-toggle"
                                onClick={() => {
                                    console.log('🔵 [AuthSetup] Toggling login password visibility:', !showLoginPassword);
                                    setShowLoginPassword(!showLoginPassword);
                                }}
                                disabled={loading}
                                title={showLoginPassword ? 'Hide password' : 'Show password'}
                            >
                                {showLoginPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="auth-setup-button save"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setShowLogin(false); setShowRegister(true); }}
                        className="auth-setup-button register"
                        style={{ marginTop: '10px' }}
                    >
                        Don't have an account? Register
                    </button>
                </form>
            )}

            {/* Register Form */}
            {showRegister && (
                <form onSubmit={handleRegister} className="auth-setup-login-form">
                    <div className="auth-setup-field">
                        <label htmlFor="reg-name">Name</label>
                        <input
                            id="reg-name"
                            type="text"
                            value={registerData.name}
                            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                            placeholder="Your Name"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="auth-setup-field">
                        <label htmlFor="reg-email">Email</label>
                        <input
                            id="reg-email"
                            type="email"
                            value={registerData.email}
                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                            placeholder="email@example.com"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="auth-setup-field">
                        <label htmlFor="reg-password">Password</label>
                        <div className="auth-setup-password-wrapper">
                            <input
                                id="reg-password"
                                type={showRegisterPassword ? 'text' : 'password'}
                                value={registerData.password}
                                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                placeholder="••••••••"
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="auth-setup-password-toggle"
                                onClick={() => {
                                    console.log('🔵 [AuthSetup] Toggling register password visibility:', !showRegisterPassword);
                                    setShowRegisterPassword(!showRegisterPassword);
                                }}
                                disabled={loading}
                                title={showRegisterPassword ? 'Hide password' : 'Show password'}
                            >
                                {showRegisterPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>
                    <div className="auth-setup-field">
                        <label htmlFor="reg-password-confirm">Confirm Password</label>
                        <div className="auth-setup-password-wrapper">
                            <input
                                id="reg-password-confirm"
                                type={showRegisterPasswordConfirm ? 'text' : 'password'}
                                value={registerData.password_confirmation}
                                onChange={(e) => setRegisterData({ ...registerData, password_confirmation: e.target.value })}
                                placeholder="••••••••"
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="auth-setup-password-toggle"
                                onClick={() => {
                                    console.log('🔵 [AuthSetup] Toggling register password confirm visibility:', !showRegisterPasswordConfirm);
                                    setShowRegisterPasswordConfirm(!showRegisterPasswordConfirm);
                                }}
                                disabled={loading}
                                title={showRegisterPasswordConfirm ? 'Hide password' : 'Show password'}
                            >
                                {showRegisterPasswordConfirm ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="auth-setup-button save"
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setShowRegister(false); setShowLogin(true); }}
                        className="auth-setup-button auth"
                        style={{ marginTop: '10px' }}
                    >
                        Already have an account? Login
                    </button>
                </form>
            )}

            {/* Login/Register Options */}
            {!showLogin && !showRegister && (
                <div className="auth-setup-login-options">
                    <button
                        type="button"
                        onClick={() => setShowLogin(true)}
                        className="auth-setup-button auth"
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowRegister(true)}
                        className="auth-setup-button register"
                    >
                        Register
                    </button>
                </div>
            )}

            {message && (
                <div className={`auth-setup-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="auth-setup-info">
                <h3>Quick Start:</h3>
                <ol>
                    <li>Login or register using the extension</li>
                    <li>Your extension auth is separate from website auth</li>
                    <li>Visit ChatGPT and start saving prompts!</li>
                </ol>
            </div>
        </div>
    );
};

export default AuthSetup;
