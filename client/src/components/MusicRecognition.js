import React, { useState } from 'react';
import axios from 'axios';
import { FaMicrophone } from 'react-icons/fa';

function MusicRecognition() {
  const [result, setResult] = useState(null); 
  const [error, setError] = useState(null);  

  const captureAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const reader = new FileReader();

        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result.split(',')[1];
          await sendAudioToServer(base64Audio);
        };
      };

      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop(); 
      }, 15000);
    } catch (error) {
      setError('Error capturing audio');
    }
  };

  const sendAudioToServer = async (audioData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/recognize-melody', { audioData });
      setResult(response.data);  
    } catch (error) {
      setError('Error recognizing melody');
    }
  };

  const getSongLink = () => {
    return result?.auddData?.song_link || result?.spotifyData?.spotifyUrl || null;
  };

  const songLink = getSongLink();

  return (
    <div className="music-recognition">
      {/* Search Bar */}
        <div className="search-bar">
        <input
            type="text"
            className="search-input"
            placeholder="Search song..."
        />
        <button onClick={captureAudio} className="mic-button">
            <FaMicrophone className="mic-icon" />
        </button>
    </div>



      {error && <p className="error-message">{error}</p>}

      {result?.auddData ? (
        <div className="result">
          <h3>Song Recognized:</h3>
          <p>Title: {result.auddData?.title || 'Unknown'}</p>
          <p>Artist: {result.auddData?.artist || 'Unknown'}</p>

          {songLink && (
            <a href={songLink} target="_blank" rel="noopener noreferrer">
              <img
                src={result.spotifyData?.albumImage || 'default_image_url'}
                alt="Album"
                className="album-image"
              />
            </a>
          )}
        </div>
      ) : (
        <p>No song recognized yet.</p>
      )}
    </div>
  );
}

export default MusicRecognition;
