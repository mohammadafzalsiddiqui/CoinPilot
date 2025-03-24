import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/dashboard';


export default function App() {
  return (
    <div className="bg-black text-white min-h-screen">
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard onBack={function (): void {
            throw new Error('Function not implemented.');
          } } />} />
      </Routes>
    </Router>
    </div>
  );
}
