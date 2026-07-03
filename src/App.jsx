import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Hero from './components/converter/Hero';
import ConvertOptionsPage from './components/converter/ConvertOptionsPage';
import './App.css';
import HomePage from './components/HomePage';
import Resize from './components/resize/Resize';

function App() {
  return (
     <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/converter" element={<Hero />} />
        <Route path="/convert-options" element={<ConvertOptionsPage />} />
        <Route path="/resize" element={<Resize />} />
      </Routes>
    </Router>
  );
}

export default App;
