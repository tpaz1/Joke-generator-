// Import necessary modules and styles
import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Functional component definition
function App() {
  // State variables for managing jokes, new joke input, displaying jokes, and handling joke addition status
  const [jokes, setJokes] = useState("");
  const [newjoke, setNewjoke] = useState("");
  const [showjoke, setShowjoke] = useState(false);
  const [jokehandle, setJokehandle] = useState("");

  // Function to asynchronously fetch a random joke from the backend
  async function getjoke() {
    try {
      const res = await fetch(
        "/api/getrandomjoke"
      );

      // Check if the response is successful
      if (!res.ok) {
        throw new Error(`Failed to fetch joke: ${res.status} ${res.statusText}`);
      }

      // Parse the response JSON and update the state
      const temjokes = await res.json();
      setJokes(temjokes);
    } catch (err) {
      // Handle errors during the fetch operation
      console.error('Error fetching joke:', err);
    }
  }

  // useEffect hook to fetch a joke on component mount
  useEffect(() => {
    getjoke();
  }, []);

  // Function to handle displaying jokes
  function handleshow() {
    setShowjoke(true);
    getjoke();
  }

  // Async function to handle submitting a new joke to the backend
  const handleclick = async () => {
    console.log(newjoke);

    try {
      // Send a POST request to add a new joke
      await axios.post("/api/addjoke", {
        addjoke: newjoke,
      });

      // Update the status for successfully adding the joke
      setJokehandle("Error: The joke was added successfully");
    } catch (err) {
      // Handle errors during the POST request
      console.log("Error", err.message);

      // Check if the error is due to a conflict (joke already exists)
      if (err.message === "Request failed with status code 409") {
        setJokehandle("Error: The joke already exists");
      }
    }

    // Clear the status after a delay
    setTimeout(() => {
      setJokehandle("");
    }, 1000);

    // Fetch a new joke after adding one
    getjoke();
  };

  // JSX structure for the component
  return (
    <div>
      <div className='getjoke'>
        {/* Display logo, title, button to get a new joke, and the current joke */}
        <img src="image.jpg" alt="logo" />
        <h1>Get Joke</h1>
        <button onClick={() => handleshow()}>Make me laugh</button>
        <p>{showjoke && jokes.text}</p>
      </div>

      <div className='addjoke'>
        {/* Form to add a new joke */}
        <h1>Add a Joke</h1>
        <textarea defaultValue={newjoke} onChange={(e) => setNewjoke(e.target.value)}></textarea><br />
        <button onClick={() => handleclick()}>Submit</button>
        <p>{jokehandle}</p>
      </div>
    </div>
  );
}

// Export the component as the default export
export default App;
