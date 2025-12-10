import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SpotifyApiComponent() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");

        if (!code) {
            console.error("Brak parametru `code` w URL.");
            return;
        }

        const expectedState = sessionStorage.getItem("spotify_oauth_state");
        if (expectedState && state !== expectedState) {
            console.warn("Niezgodny `state` – przerywam łączenie.");
            return;
        }

        const jwt = localStorage.getItem("access_token");
        if (!jwt) {
            console.error("Brak JWT – zaloguj się przed łączeniem Spotify.");
            return;
        }
		console.log(code);

        (async () => {
            try {
                const resp = await fetch("http://127.0.0.1:8000/auth/spotify/connect/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${jwt}`,
                    },
                    body: JSON.stringify({
                        code,
                        redirect_uri: "http://127.0.0.1:5173/spotify/callback",
                    }),
                });

                const text = await resp.text();
                if (!resp.ok) {
                    console.error("Błąd łączenia Spotify:", resp.status, text);
                    return;
                }

                // sprzątanie
                sessionStorage.removeItem("spotify_oauth_state");

                let data = {};
                try { data = JSON.parse(text); }  catch (err) {
                    console.warn("Nie udało się sparsować odpowiedzi JSON z backendu:", err, text);
                }

                console.log("Konto Spotify połączone ✅", data);


                // przekieruj użytkownika gdzieś sensownie
                navigate("/");
            } catch (e) {
                console.error("Wyjątek podczas łączenia Spotify:", e);
            }
        })();
    }, [navigate]);

    return (
        <div style={{ padding: 20 }}>
            <h2>Wracam ze Spotify…</h2>
            <p>Łączę konto. Zerknij w konsolę, jeśli coś pójdzie nie tak.</p>
        </div>
    );
}