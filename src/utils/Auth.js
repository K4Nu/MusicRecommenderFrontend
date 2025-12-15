// Auth.js
const Auth = {
    // Get tokens from localStorage
    getTokens() {
        return {
            accessToken: localStorage.getItem("access_token"),
            refreshToken: localStorage.getItem("refresh_token"),
        };
    },

    // Store tokens in localStorage
    setTokens(accessToken, refreshToken) {
        if (accessToken) localStorage.setItem("access_token", accessToken);
        if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
    },

    // Clear tokens from localStorage
    clearTokens() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
    },

    // Check if user is authenticated (DEV heurystyka)
    isAuthenticated() {
        const { accessToken } = this.getTokens();
        return !!accessToken && !this.isTokenExpired(accessToken);
    },

    // Refresh access token
    async refreshToken() {
        const { refreshToken: storedRefreshToken } = this.getTokens();
        if (!storedRefreshToken) throw new Error("No refresh token available");

        const refreshUrl =
            import.meta.env.VITE_REFRESH_URL ||
            "http://127.0.0.1:8000/auth/jwt/refresh/"; // trailing slash

        const resp = await fetch(refreshUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // credentials: "include" nie jest wymagane dla czystych JWT w nagłówku
            body: JSON.stringify({ refresh: storedRefreshToken }),
        });

        if (!resp.ok) {
            this.clearTokens();
            throw new Error(`Refresh failed: ${resp.status}`);
        }

        const data = await resp.json();
        const newAccess = data.access || data.access_token;
        const newRefresh = data.refresh || data.refresh_token || storedRefreshToken;
        this.setTokens(newAccess, newRefresh);
        return data;
    },

    // Logout user
    async logout() {
        try {
            const logoutUrl =
                import.meta.env.VITE_LOGOUT_URL || "http://127.0.0.1:8000/auth/logout/"; // slash
            await fetch(logoutUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // jeśli masz sesje/CSRF – ok; dla JWT-only można pominąć
                body: JSON.stringify({}),
            });
        } catch (e) {
            console.error("Logout API call failed:", e);
        } finally {
            this.clearTokens();
            window.location.href = "/";
        }
    },

    // Auth header for API
    getAuthHeader() {
        const { accessToken } = this.getTokens();
        return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    },

    // JWT helpers (bezpieczne base64url → base64)
    parseJwt(token) {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
            const payload = JSON.parse(atob(padded));
            return payload;
        } catch {
            return null;
        }
    },

    isTokenExpired(token) {
        const payload = this.parseJwt(token);
        if (!payload || !payload.exp) return true;
        const now = Math.floor(Date.now() / 1000);
        return payload.exp < now;
    },

    generatePassword(length) {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
        const array = new Uint32Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, (x) => chars[x % chars.length]).join("");
    },
    async generateCodeChallenge(codeVerifier) {
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);

        const digest = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(digest));

        // zwykłe base64
        let base64 = btoa(String.fromCharCode(...hashArray));

        // zamiana na base64url (bez + / =)
        base64 = base64
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

        return base64;
    },

    spotifyConnect() {
        const randomState = "Spotify" + Auth.generatePassword(64);
        sessionStorage.setItem("spotify_oauth_state", randomState);

        const clientId = encodeURIComponent(import.meta.env.VITE_SPOTIFY_CLIENT_ID);
        const redirectUri = encodeURIComponent(import.meta.env.VITE_SPOTIFY_REDIRECT_URL);
        const scope = encodeURIComponent(
            "user-top-read user-read-recently-played playlist-read-private playlist-read-collaborative user-library-read user-read-private user-read-email"
        );
        const state = encodeURIComponent(randomState);

        const url =
            `https://accounts.spotify.com/authorize?client_id=${clientId}` +
            `&response_type=code` +
            `&redirect_uri=${redirectUri}` +
            `&scope=${scope}` +
            `&state=${state}`;

        window.location.assign(url);
    },
    async youtubeConnect()
    {
        const randomState = "Youtube" + Auth.generatePassword(64);
        sessionStorage.setItem("youtube_oauth_state", randomState);

        const codeVerifier=Auth.generatePassword(64);
        sessionStorage.setItem("youtube_code_verifier", codeVerifier);

        const codeChallenge=await Auth.generateCodeChallenge(codeVerifier);

        const clientId = encodeURIComponent(import.meta.env.VITE_YOUTUBE_CLIENT_ID);
        const redirectUri = encodeURIComponent(import.meta.env.VITE_YOUTUBE_REDIRECT_URL);
        const state = encodeURIComponent(randomState);

        // Scope dla YouTube - read-only access
        const scope = encodeURIComponent('https://www.googleapis.com/auth/youtube.readonly');

        // URL do Google OAuth
        const url =
            "https://accounts.google.com/o/oauth2/v2/auth?" +
            `client_id=${clientId}&` +
            `redirect_uri=${redirectUri}&` +
            `response_type=code&` +
            `scope=${scope}&` +
            `state=${state}&` +
            `code_challenge=${codeChallenge}&` +
            `code_challenge_method=S256&` +
            `access_type=offline&` +
            `prompt=consent`;


        // Przekieruj użytkownika
        window.location.href = url;
    }
};




export default Auth