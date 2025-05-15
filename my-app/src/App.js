import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Roadmap from './pages/Roadmap/roadmap';
import Login from "./pages/Login/Login"; 
import SignUp from "./pages/SignUp/SignUp"; 
import ResetPassword from "./pages/ResetPassword/ResetPassword"; 
import ResetPasswordEmail from './pages/ResetPasswordEmail/ResetPasswordEmail';
import AdminPage from "./pages/AdminPage/AdminPage"; 
import UserPage from "./pages/AdminPage/UserPage";

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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp/>} />
        <Route path="/resetPassword" element={<ResetPassword/>} />
        <Route path="/resetPasswordEmail" element={<ResetPasswordEmail />} />
        <Route path="/admin" element={<AdminPage />} /> {/* Đường dẫn đến AdminPage */}
        <Route path="/user" element={<UserPage />} /> {/* Đường dẫn đến UserPage */}
        {/* Thêm các route khác nếu cần */}
      </Routes>
    </Router>
  );
}
