import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Welcome to Quizzie</h1>
      <Link to="/register">Register</Link>
    </div>
  );
};

export default Home;
