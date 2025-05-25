import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QRScanner from "./QRScanner";
import UploadPage from "./UploadPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<QRScanner />} />
        <Route path="/upload" element={<UploadPage />} />
      </Routes>
    </Router>
  );
}

export default App;
