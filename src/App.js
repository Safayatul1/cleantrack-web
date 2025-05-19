import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QRScanner from './QRScanner';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<QRScanner />} />
      </Routes>
    </Router>
  );
}

export default App;