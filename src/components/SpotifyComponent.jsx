import Auth from "./Auth";
import generateCodeChallenge from "./Auth.jsx"
export default async function spotifyConnect() {
    const randomState = "Spotify" + Auth.generatePassword(64);
    const codeVerifier = Auth.generatePassword(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    sessionStorage.setItem("spotify_oauth_state", randomState);
    sessionStorage.setItem("spotify_code_verifier", codeVerifier);

    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = encodeURIComponent(import.meta.env.VITE_SPOTIFY_REDIRECT_URL);
    const scope = encodeURIComponent(
        "user-top-read user-read-recently-played playlist-read-private playlist-read-collaborative user-library-read user-read-private user-read-email"
    );

    const url =
        `https://accounts.spotify.com/authorize?client_id=${clientId}` +
        `&response_type=code` +
        `&redirect_uri=${redirectUri}` +
        `&scope=${scope}` +
        `&state=${randomState}` +
        `&code_challenge_method=S256` +
        `&code_challenge=${codeChallenge}`;

    window.location.assign(url);
}
