// App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logoImage from '/image.png';
import Raindrop from './Raindrop';

import './App.css';

function App() {
  const [jokes, setJokes] = useState("");
  const [newJoke, setNewJoke] = useState("");
  const [showJoke, setShowJoke] = useState(false);
  const [jokeHandle, setJokeHandle] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  async function getJoke() {
    try {
      const res = await fetch("/api/getrandomjoke");

      if (!res.ok) {
        throw new Error(`Failed to fetch joke: ${res.status} ${res.statusText}`);
      }

      const tempJokes = await res.json();
      setJokes(tempJokes);
    } catch (err) {
      console.error('Error fetching joke:', err);
    }
  }

  useEffect(() => {
    getJoke();
  }, []);

  function handleShow() {
    setShowJoke(true);
    getJoke();
  }

  const handleClick = async () => {
    console.log(newJoke);

    try {
      await axios.post("/api/addjoke", {
        addJoke: newJoke,
      });

      setJokeHandle("Success: The joke was added successfully");
    } catch (err) {
      console.log("Error", err.message);

      if (err.message === "Request failed with status code 409") {
        setJokeHandle("Error: The joke already exists");
      }
    }

    setTimeout(() => {
      setJokeHandle("");
    }, 10000);

    getJoke();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const renderRaindrops = () => {
    const numberOfRaindrops = 50;

    return Array.from({ length: numberOfRaindrops }, (_, index) => (
      <Raindrop key={index} left={`${Math.random() * 100}vw`} duration={`${Math.random() * 2 + 1}s`} />
    ));
  };

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <div className="rain-background">{renderRaindrops()}</div>
      <div className='getjoke'>
      <img src={logoImage} alt="logo" />
        <h1>Get Joke</h1>
        <button className={`button ${darkMode ? 'dark' : ''}`} onClick={() => handleShow()}>
          Make me laugh
        </button>
        <p className={`joke-text ${showJoke ? 'show' : ''}`}>{showJoke && <span className="show">{`"${jokes.text}"`}</span>}</p>
      </div>

      <div className='addjoke'>
        <h1>Add a Joke</h1>
        <textarea
          value={newJoke}
          onChange={(e) => setNewJoke(e.target.value)}
          className={`textarea ${darkMode ? 'dark' : ''}`}
        ></textarea>
        <button className={`button ${darkMode ? 'dark' : ''}`} onClick={() => handleClick()}>
          Submit
        </button>
        <p className={`joke-handle ${jokeHandle ? 'show' : ''}`}>{jokeHandle}</p>
      </div>

      <div className='dark-mode-toggle'>
        <label className={`switch ${darkMode ? 'on' : ''}`} onClick={toggleDarkMode}>
          <span className={`slider ${darkMode ? 'on' : ''}`}></span>
        </label>
        <p className={`dark-mode-text ${darkMode ? 'on' : ''}`}>Dark Mode</p>
      </div>
    </div>
  );
}

export default App;
