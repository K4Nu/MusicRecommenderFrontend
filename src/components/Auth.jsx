const Auth = () => {
    return {
        // Get tokens from localStorage
        getTokens: () => {
            return {
                accessToken: localStorage.getItem("access_token"),
                refreshToken: localStorage.getItem("refresh_token"),
            };
        },

        // Store tokens in localStorage
        setTokens: (accessToken, refreshToken) => {
            localStorage.setItem("access_token", accessToken);
            if (refreshToken) {
                localStorage.setItem("refresh_token", refreshToken);
            }
        },

        // Clear tokens
        clearTokens: () => {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
        },
    };
};

export default Auth;
