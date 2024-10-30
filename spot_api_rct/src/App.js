import React, { useState, useEffect } from 'react';
const colors = require('tailwindcss/colors')
const SpotifyArtistSearch = () => {
  const [token, setToken] = useState('');
  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const CLIENT_ID = '975be576524f4742a5eabdc215b9fe9b';
  const CLIENT_SECRET = 'bf9981d9b5d44a9986d7c2d6641161e9';
  const ARTIST_NAME = 'Queen';

  useEffect(() => {
    getClientCreds();
  }, []);

  const getClientCreds = async () => {
    try {
      const authParameters = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
        },
        body: 'grant_type=client_credentials'
      };

      const response = await fetch('https://accounts.spotify.com/api/token', authParameters);
      const data = await response.json();
      setToken(data.access_token);
      
      // Once we have the token, search for the artist
      if (data.access_token) {
        await searchArtist(data.access_token);
      }
    } catch (err) {
      setError('Failed to get access token');
      console.error(err);
    }
  };

  const searchArtist = async (accessToken) => {
    try {
      setIsLoading(true);
      const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(ARTIST_NAME)}&type=artist`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      const data = await response.json();
      const foundArtist = data.artists.items[0];
      setArtist(foundArtist);
      
      // Get top tracks once we have the artist
      if (foundArtist) {
        await getTopTracks(foundArtist.id, accessToken);
      }
    } catch (err) {
      setError('Failed to search artist');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTopTracks = async (artistId, accessToken, market = 'US') => {
    try {
      const topTracksUrl = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=${market}`;
      
      const response = await fetch(topTracksUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      const data = await response.json();
      setTopTracks(data.tracks);
    } catch (err) {
      setError('Failed to fetch top tracks');
      console.error(err);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 bg-white rounded-lg shadow-md">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">{ARTIST_NAME}'s Top Tracks</h1>
        
        {artist && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">Artist Info:</h3>
            <p className="mb-1">Name: {artist.name}</p>
            <p className="mb-1">Followers: {artist.followers?.total.toLocaleString()}</p>
            <p className="mb-1">Popularity: {artist.popularity}</p>
          </div>
        )}
        
        {topTracks.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-2">Top Tracks:</h3>
            <div className="space-y-2">
              {topTracks.map((track) => ( //map function is used for iterating through elements of an array and displaying them in this case
                <div key={track.id} className="p-3 bg-gray-50 rounded">
                  <p className="font-medium text-purple-500">{track.name}</p>
                  <p className="text-sm text-gray-600">
                    Album: {track.album.name} • Popularity: {track.popularity}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotifyArtistSearch;