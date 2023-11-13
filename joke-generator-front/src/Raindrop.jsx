// Raindrop.js
import React from 'react';
import './Raindrop.css';

const Raindrop = ({ left, duration }) => {
  return <img className="raindrop" src="/rain.png" alt="raindrop" style={{ left, animationDuration: duration }} />;
};

export default Raindrop;
