import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Roadmap from './pages/Roadmap/roadmap';
import Login from "./pages/Login/Login"; 
import SignUp from "./pages/SignUp/SignUp"; 

function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Front-end Roadmap</h1>
      <p>Chào mừng, đây là lộ trình front-end cho các anh chị em</p>
      <Roadmap />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp/>} />
      </Routes>
    </Router>
  );
}
