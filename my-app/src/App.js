import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Roadmap from "./roadmap";

function Home() {
  return (
    <div style={{ textAlign: "center" }}>
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
      </Routes>
    </Router>
  );
}
