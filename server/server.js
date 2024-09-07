const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

const getSpotifyToken = async () => {
    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            new URLSearchParams({ grant_type: 'client_credentials' }),
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(
                        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                    ).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching Spotify token:', error);
        throw new Error('Failed to retrieve Spotify token');
    }
};

const getSpotifyTrackData = async (trackName) => {
    try {
        const token = await getSpotifyToken();

        const spotifyResponse = await axios.get(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(trackName)}&type=track&limit=1`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (spotifyResponse.data.tracks.items.length > 0) {
            const track = spotifyResponse.data.tracks.items[0];
            return {
                albumImage: track.album.images[0]?.url,
                artist: track.artists[0]?.name,
                spotifyUrl: track.external_urls.spotify,
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching Spotify track data:', error);
        throw new Error('Failed to retrieve Spotify track data');
    }
};

app.post('/api/recognize-melody', upload.single('file'), async (req, res) => {
    try {
        const audioData = req.body.audioData;
        const formData = new FormData();

        const buffer = Buffer.from(audioData, 'base64');
        formData.append('file', buffer, { filename: 'audio.wav' });
        formData.append('api_token', process.env.AUDD_API_KEY);

        const auddResponse = await axios.post('https://api.audd.io/', formData, {
            headers: { ...formData.getHeaders() },
        });

        const trackName = auddResponse.data.result?.title;
        if (trackName) {
            const spotifyData = await getSpotifyTrackData(trackName);
            if (spotifyData) {
                res.json({
                    auddData: auddResponse.data.result,
                    spotifyData,
                });
            } else {
                res.json({
                    auddData: auddResponse.data.result,
                    spotifyData: null,
                });
            }
        } else {
            res.status(404).json({ error: 'Could not recognize song' });
        }
    } catch (error) {
        console.error('Error recognizing melody:', error);
        res.status(500).json({ error: 'Error recognizing melody' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
