import { jwtDecode } from "jwt-decode";

const ONBOARDING_KEYS = [
    "onboarding_buffer",
    "onboarding_tracks",
    "onboarding_position",
    "onboarding_user_id",
];

const Auth = {
    // =========================
    // TOKENS
    // =========================
    getTokens() {
        return {
            accessToken: localStorage.getItem("access_token"),
            refreshToken: localStorage.getItem("refresh_token"),
        };
    },

    setTokens(accessToken, refreshToken) {
        if (accessToken) localStorage.setItem("access_token", accessToken);
        if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
    },

    clearTokens() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
    },

    // =========================
    // AUTH STATE
    // =========================
    isAuthenticated() {
        const { accessToken } = this.getTokens();
        return !!accessToken && !this.isTokenExpired(accessToken);
    },

    getUserId() {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) return null;

            const decoded = jwtDecode(token);
            return decoded.user_id ?? decoded.id ?? null;
        } catch (e) {
            console.error("Failed to decode JWT", e);
            return null;
        }
    },

    // =========================
    // TOKEN REFRESH
    // =========================
    async refreshToken() {
        const { refreshToken } = this.getTokens();
        if (!refreshToken) throw new Error("No refresh token available");

        const refreshUrl =
            import.meta.env.VITE_REFRESH_URL ||
            "http://127.0.0.1:8000/auth/jwt/refresh/";

        const resp = await fetch(refreshUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!resp.ok) {
            this.clearTokens();
            throw new Error(`Refresh failed: ${resp.status}`);
        }

        const data = await resp.json();
        this.setTokens(
            data.access || data.access_token,
            data.refresh || data.refresh_token || refreshToken
        );

        return data;
    },

    // =========================
    // 🔥 LOGOUT (FIX HERE)
    // =========================
    async logout() {
        try {
            const logoutUrl =
                import.meta.env.VITE_LOGOUT_URL ||
                "http://127.0.0.1:8000/auth/logout/";

            await fetch(logoutUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({}),
            });
        } catch (e) {
            console.error("Logout API call failed:", e);
        } finally {
            // 🔥 TOKEN CLEANUP
            this.clearTokens();

            // 🔥 ONBOARDING CLEANUP (CRITICAL)
            ONBOARDING_KEYS.forEach(key =>
                localStorage.removeItem(key)
            );

            window.location.href = "/";
        }
    },

    // =========================
    // HEADERS
    // =========================
    getAuthHeader() {
        const { accessToken } = this.getTokens();
        return accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {};
    },

    // =========================
    // JWT HELPERS
    // =========================
    parseJwt(token) {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url
                .replace(/-/g, "+")
                .replace(/_/g, "/")
                .padEnd(base64Url.length + (4 - (base64Url.length % 4)) % 4, "=");

            return JSON.parse(atob(base64));
        } catch {
            return null;
        }
    },

    isTokenExpired(token) {
        const payload = this.parseJwt(token);
        if (!payload?.exp) return true;
        return payload.exp < Math.floor(Date.now() / 1000);
    },

    // =========================
    // OAUTH HELPERS
    // =========================
    generatePassword(length) {
        const chars =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
        const array = new Uint32Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, x => chars[x % chars.length]).join("");
    },

    async generateCodeChallenge(codeVerifier) {
        const data = new TextEncoder().encode(codeVerifier);
        const digest = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(digest));

        return btoa(String.fromCharCode(...hashArray))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
    },

    // =========================
    // SPOTIFY
    // =========================
    spotifyConnect: () => {
        const randomState = "Spotify" + Auth.generatePassword(64);
        sessionStorage.setItem("spotify_oauth_state", randomState);

        const clientId = encodeURIComponent(import.meta.env.VITE_SPOTIFY_CLIENT_ID);
        const redirectUri = encodeURIComponent(import.meta.env.VITE_SPOTIFY_REDIRECT_URL);
        const scope = encodeURIComponent(
            "user-top-read user-read-recently-played playlist-read-private playlist-read-collaborative user-library-read user-read-private user-read-email"
        );

        window.location.assign(
            `https://accounts.spotify.com/authorize` +
            `?client_id=${clientId}` +
            `&response_type=code` +
            `&redirect_uri=${redirectUri}` +
            `&scope=${scope}` +
            `&state=${encodeURIComponent(randomState)}`
        );
    },

    // =========================
    // YOUTUBE
    // =========================
    youtubeConnect: async () => {
        const randomState = "Youtube" + Auth.generatePassword(64);  // Changed from this
        sessionStorage.setItem("youtube_oauth_state", randomState);

        const verifier = Auth.generatePassword(64);  // Changed from this
        sessionStorage.setItem("youtube_code_verifier", verifier);

        const challenge = await Auth.generateCodeChallenge(verifier);  // Changed from this

        const clientId = encodeURIComponent(import.meta.env.VITE_YOUTUBE_CLIENT_ID);
        const redirectUri = encodeURIComponent(import.meta.env.VITE_YOUTUBE_REDIRECT_URL);

        window.location.href =
            "https://accounts.google.com/o/oauth2/v2/auth?" +
            `client_id=${clientId}&` +
            `redirect_uri=${redirectUri}&` +
            `response_type=code&` +
            `scope=${encodeURIComponent("https://www.googleapis.com/auth/youtube.readonly")}&` +
            `state=${encodeURIComponent(randomState)}&` +
            `code_challenge=${challenge}&` +
            `code_challenge_method=S256&` +
            `access_type=offline&prompt=consent`;
    },
};

export default Auth;
