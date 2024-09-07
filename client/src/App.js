import React from 'react';
import MusicRecognition from './components/MusicRecognition';
import './App.css';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <div className="search-bar">
                    {/* <input type="text" placeholder="Search song..." className="search-input" /> */}
                    <MusicRecognition />
                </div>
            </header>
        </div>
    );
}

export default App;
