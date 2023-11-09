import './App.css'
import  { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [jokes, setJokes] = useState("");
  const [newjoke, setNewjoke] = useState("");
  const [showjoke, setShowjoke] = useState(false);
  const [jokehandle, setJokehandle] = useState("");
  async function getjoke() {
    try {
      const res = await fetch(
        "http://localhost:8080/getrandomjoke"
      );
      const temjokes = await res.json();
      setJokes(temjokes);
      
      console.log(jokes);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getjoke()
  }, []); 

  function handleshow(){
    setShowjoke(true);
    getjoke()
  }

  const handleclick = async () => {
    console.log(newjoke);
    try {
      await axios.post("http://localhost:8080/addjoke", {
        addjoke: newjoke,
      });
      setJokehandle("error the joke added successfully")
    } catch (err) {
        console.log("Error", err.message);
        if(err.message=="Request failed with status code 409"){
          setJokehandle("the joke already exist")
        }
        
    }
    setTimeout(() => {
      setJokehandle("")
    }, 1000);
    getjoke()
    
  };
  

  return (
    <div>
      <div className='getjoke'>
      <img src="image.jpg" alt="logo" />
      <h1>get joke</h1>
      <button onClick={()=>handleshow()}>make me laugh</button>
      <p>{showjoke&&jokes.text}</p>
      </div>
<div className='addjoke'>
<h1>add a joke</h1>
<textarea defaultValue={newjoke} onChange={(e)=>setNewjoke(e.target.value)}></textarea><br />
<button onClick={()=>handleclick()}>submit</button>
<p>{jokehandle}</p>
</div>
    </div>
  )
}

export default App
