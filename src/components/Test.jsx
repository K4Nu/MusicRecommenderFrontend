import Auth from "./Auth";

export default function Test() {
    console.log(Auth.getTokens());
    return Auth.isAuthenticated() ? (
        <button onClick={Auth.spotifyConnect}>
            Connect Spotify Account
        </button>
    ) : null;
}