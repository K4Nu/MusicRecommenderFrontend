const Auth = {
    // Get tokens from localStorage
    getTokens: () => {
        return {
            accessToken: localStorage.getItem("access_token"),
            refreshToken: localStorage.getItem("refresh_token"),
            firstName: localStorage.getItem("first_name"),
        };
    },

    // Store tokens in localStorage
    setTokens: (accessToken, refreshToken,firstName) => {
        localStorage.setItem("access_token", accessToken);
        if (refreshToken) {
            localStorage.setItem("refresh_token", refreshToken);
        }
        if (firstName)
        {
            localStorage.setItem("first_name",firstName);
        }
    },

    // Clear tokens from localStorage
    clearTokens: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("first_name");
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        const { accessToken } = Auth.getTokens();
        return accessToken && !Auth.isTokenExpired(accessToken);
    },

    // Refresh access token
    refreshToken: async () => {
        const { refreshToken: storedRefreshToken } = Auth.getTokens();

        if (!storedRefreshToken) {
            throw new Error("No refresh token available");
        }

        try {
            const refreshUrl = import.meta.env.VITE_REFRESH_URL || "http://127.0.0.1:8000/auth/token/refresh";
            const response = await fetch(refreshUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    refresh: storedRefreshToken
                })
            });

            if (response.ok) {
                const data = await response.json();
                Auth.setTokens(data.access_token, data.refresh_token);
                return data;
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (e) {
            console.error("Token refresh failed:", e);
            Auth.clearTokens();
            throw e;
        }
    },

    // Login user (or you can remove this if you handle login separately)
    login: async (credentials) => {
        try {
            const loginUrl = import.meta.env.VITE_LOGIN_URL || "http://127.0.0.1:8000/auth/login";
            const response = await fetch(loginUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials)
            });

            if (response.ok) {
                const data = await response.json();
                Auth.setTokens(data.access_token, data.refresh_token);
                return data;
            } else {
                throw new Error(`Login failed! status: ${response.status}`);
            }
        } catch (e) {
            console.error("Login failed:", e);
            throw e;
        }
    },

    // Logout user
    logout: async () => {
        try {
            const { refreshToken: storedRefreshToken } = Auth.getTokens();

            if (storedRefreshToken) {
                const logoutUrl = import.meta.env.VITE_LOGOUT_URL || "http://127.0.0.1:8000/auth/logout";
                await fetch(logoutUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        refresh: storedRefreshToken
                    })
                });
            }
        } catch (e) {
            console.error("Logout API call failed:", e);
        } finally {
            Auth.clearTokens();
            window.location.href = '/';
        }
    },

    // Get authorization header for API requests
    getAuthHeader: () => {
        const { accessToken } = Auth.getTokens();
        return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    },
    parseJwt:(token)=> {
        try {
            const base64Payload = token.split('.')[1];
            const payload = JSON.parse(atob(base64Payload));
            return payload;
        } catch (e) {
            return null;
        }
    },
    isTokenExpired:(token)=>{
        const payload=Auth.parseJwt(token);
        if(!payload || !payload.exp)return true;

        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp<currentTime;

    }
};

export default Auth;