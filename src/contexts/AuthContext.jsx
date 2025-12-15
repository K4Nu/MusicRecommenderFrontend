import { createContext, useContext, useState, useEffect } from "react";
import Auth from "../utils/Auth.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuth = async () => {
        try {
            // 1. access token
            if (Auth.isAuthenticated()) {
                setIsAuthenticated(true);
                setUser({ authenticated: true });
                return;
            }

            // 2.refresh token
            const tokens = Auth.getTokens();
            const refreshToken = tokens?.refreshToken;

            if (refreshToken) {
                await Auth.refreshToken();
                setIsAuthenticated(true);
                setUser({ authenticated: true });
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            setIsAuthenticated(false);
            setUser(null);
            Auth.clearTokens();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (accessToken, refreshToken) => {
        Auth.setTokens(accessToken, refreshToken);
        setIsAuthenticated(true);
        setUser({ authenticated: true });
    };

    const logout = async () => {
        try {
            await Auth.logout();
        } catch (e) {
            console.error(e);
        } finally {
            Auth.clearTokens();
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

export default AuthContext;
