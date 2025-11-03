import Auth from "./Auth";

const ThirdPartyServices = {
    spotifyConnect: async () => {
        const jwt = localStorage.getItem('access_token');

        if (!jwt) {
            throw new Error('Please login first');
        }

        const response = await fetch("http://127.0.0.1:8000/auth/spotify/connect/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`
            }
        });

        if (!response.ok) throw new Error('Connection failed');

        const data = await response.json();

        if (data.url) {
            window.location.href = data.url;
        }

        return data;
    }
};

export default ThirdPartyServices;