import React from 'react';
import MusicRecognition from './components/MusicRecognition';
import './App.css';

function App() {
    return (
        <div className="App">
            <header className="App-header">
            <div className="App_logo"></div>
                <div className="search-bar">
                    <MusicRecognition />
                </div>
            </header>
        </div>
    );
}

export default App;
