import {useNavigate} from 'react-router-dom';
import {useEffect} from "react";
const YoutubeApiComponent = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");
        const codeVerifier = sessionStorage.getItem("youtube_code_verifier");

        console.log("🔍 DEBUG - Dane przed wysłaniem:");
        console.log("  code:", code);
        console.log("  codeVerifier:", codeVerifier);
        console.log("  state:", state);

        const jwt = localStorage.getItem("access_token");
        if (!jwt) {
            console.error("❌ Missing JWT token - log in before connection to Youtube");
            navigate("/login");
            return;
        }

        if (!code) {
            console.error("❌ Missing param `code` in the URL.");
            return;
        }

        const expectedState = sessionStorage.getItem("youtube_oauth_state");
        if (expectedState && state !== expectedState) {
            console.warn("⚠️ Incompatible `state` – shutting down the connection.");
            return;
        }

        (async () => {
            try {
                const payload = {
                    code,
                    redirect_uri: "http://127.0.0.1:5173/youtube/callback",
                    codeVerifier,
                };

                console.log("📤 Sending payload:", payload);

                const resp = await fetch("http://127.0.0.1:8000/auth/youtube/connect/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${jwt}`,
                    },
                    body: JSON.stringify(payload),
                });

                const text = await resp.text();

                if (!resp.ok) {
                    console.error("❌ Error Youtube connection", resp.status);
                    try {
                        const errorData = JSON.parse(text);
                        console.error("📄 Full backend error:", errorData);

                        // Szczegółowe logowanie
                        if (errorData.detail) {
                            console.error("  ❗ Detail:", errorData.detail);
                        }
                        if (errorData.google_error) {
                            console.error("  🔴 Google error:", errorData.google_error);
                        }
                        if (errorData.status) {
                            console.error("  📊 Status:", errorData.status);
                        }
                    } catch (parseError) {
                        console.error("❌ Could not parse error response:", text, parseError);
                    }
                    return;
                }

                sessionStorage.removeItem("youtube_oauth_state");
                sessionStorage.removeItem("youtube_code_verifier");

                let data = {};
                try {
                    data = JSON.parse(text);
                } catch (err) {
                    console.warn("⚠️ Could not parse JSON:", err, text);
                }

                console.log("✅ Youtube client connected");
                console.log("📊 Response data:", data);
                navigate("/");

            } catch (e) {
                console.error("💥 Could not connect to Youtube on backend:", e);
            }
        })();

    }, [navigate]);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Connecting to YouTube...</h1>
            <p>Please wait while we connect your account.</p>
            <p style={{ fontSize: '12px', color: '#666' }}>
                Check the console for details
            </p>
        </div>
    );
}

export default YoutubeApiComponent;