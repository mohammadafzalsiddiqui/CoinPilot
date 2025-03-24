import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/dashboard';
import SmartPool from './pages/SmartPool';

export default function App() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard onBack={() => {}} />} />
          <Route path="/smartpool" element={<SmartPool />} />
        </Routes>
      </Router>
    </div>
  );
}