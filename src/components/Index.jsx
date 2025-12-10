import Auth from "./Auth";

export default function Index() {
    console.log(Auth.getTokens());
    return Auth.isAuthenticated() ? (
        <ul>
        <button onClick={Auth.spotifyConnect}>
            Connect Spotify Account
        </button>
            <button onClick={Auth.youtubeConnect}>
                Connect Youtube Account
            </button>
        </ul>
    ) : null;
}