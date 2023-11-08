import './App.css'
import  { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [jokes, setJokes] = useState(["frog","rabbit","lol"]);
  const [newjoke, setNewjoke] = useState("");
  const [showjoke, setShowjoke] = useState(false);
  const [jokenum, setJokenum] = useState();

  useEffect(() => {
    const test = async () => {
      try {
        const res = await fetch(
          "http://localhost:8080/"
        );
        const temjokes = await res.json();
        setJokes(temjokes);
        
        console.log(jokes);
      } catch (err) {
        console.log(err);
      }
    };
    test();
  }, []);
  function handleshow(){
    setJokenum(Math.floor(Math.random() * jokes.length))
    setShowjoke(true);
  }

  const handleclick = async () => {
    console.log(newjoke);
    try {
      await axios.post("https://momsrecipe-api.onrender.com/addrecipe", {
        addjoke: newjoke,
      });
    } catch (err) {
        console.log("Error", err.message);
    }
    const test = async () => {
      try {
        const res = await fetch(
          "http://localhost:8080/"
        );
        const temjokes = await res.json();
        setJokes(temjokes);
        
        console.log(jokes);
      } catch (err) {
        console.log(err);
      }
    };
    test();
    
  };
  

  return (
    <div>
      <div className='getjoke'>
      <img src="image.jpg" alt="logo" />
      <h1>get joke</h1>
      <button onClick={()=>handleshow()}>make me laugh</button>
      <p>{showjoke&&jokes[jokenum]}</p>
      </div>
<div className='addjoke'>
<h1>add a joke</h1>
<textarea defaultValue={newjoke} onChange={(e)=>setNewjoke(e.target.value)}></textarea><br />
<button onClick={()=>handleclick()}>submit</button>
</div>
    </div>
  )
}

export default App
