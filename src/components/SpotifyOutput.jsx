import { useEffect, useState } from "react";
const SpotifyOutput = () =>
{
    const [spotifyData, setSpotifyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

       useEffect(() => {
           const getData = async () => {
               try {
                   const token = localStorage.getItem("access_token");

                   if (!token) {
                       setError("No access token found");
                       setLoading(false);
                       return;
                   }

                   const response = await fetch("http://127.0.0.1:8000/user/top_track/?time_range=long_term", {
                       method: "GET",
                       headers: {
                           "Authorization": `Bearer ${token}`,  // ← Token w headerze
                       },
                   });

                   if (!response.ok) {
                       const err = await response.json().catch(() => ({}));
                       console.error("Spotify info error:", err);
                       setError(err.detail || "Failed to fetch data");
                       setLoading(false);
                       return;
                   }

                   const data = await response.json();
                   console.log("Spotify info success:", data);
                   setSpotifyData(data);
                   setLoading(false);
               } catch (err) {
                   console.error("Request failed:", err);
                   setError(err.message);
                   setLoading(false);
               }
           };

           getData();
       }, []);
       if(loading) return <div>Loading...</div>
    if(error) return <div>Error: {error}</div>;
    if(!spotifyData) return <div>No data</div>;

    return (
        <>
        <h1>Top Tracks</h1>
            <ul className="list-none">
                {spotifyData.map((track) => (
                <li key={track.spotify_id}>
                    <img src={track.image_url} alt={track.name} width="50" />
                    <strong>#{track.rank}</strong> {track.name} - {track.artists.join(", ")}
                </li>
                ))}
            </ul>
        </>
    )
}
export default SpotifyOutput;