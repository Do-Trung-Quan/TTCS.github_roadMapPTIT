import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import component Header, Footer và Chatbot
import Header from './components/Header/header';
import Footer from "./components/Footer/footer";
import Chatbot from './components/Chatbot/chatbot'; // Import Chatbot
import 'bootstrap/dist/css/bootstrap.min.css';

// Import các component trang
import Home from './pages/Home/Home';
import AboutUs from './pages/AboutUs/AboutUs';
import Roadmap from './pages/Roadmap/roadmap';
import Login from "./pages/Login/Login";
import SignUp from "./pages/SignUp/SignUp";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import ResetPasswordEmail from './pages/ResetPasswordEmail/ResetPasswordEmail';

// Import các component trang Admin
import AdminPage from "./pages/AdminPage/AdminPage";
import ProfilePage from "./pages/AdminPage/ProfilePage";
import SettingsPage from "./pages/AdminPage/SettingsPage";
import UserManagementPage from "./pages/AdminPage/UserManagementPage";
import EditRoadmapPage from "./pages/AdminPage/EditRoadmapPage";
import RoadmapsPage from "./pages/AdminPage/RoadmapsPage";
import ActivityPage from './pages/AdminPage/ActivityPage';

// Import LanguageProvider và AuthProvider
import { AuthProvider } from './context/AuthContext';

// AdminLayout component
const AdminLayout = ({ currentLang }) => {
  return (
    <AdminPage currentLang={currentLang} />
  );
};

export default function App() {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('currentLang') || 'vi';
  });

  useEffect(() => {
    localStorage.setItem('currentLang', currentLang);
  }, [currentLang]);

  return (
    <AuthProvider>
      <Router>
        <Header currentLang={currentLang} setCurrentLang={setCurrentLang} />

        {/* Thêm Chatbot ở đây để hiển thị trên tất cả các trang */}
        <Chatbot />

        <Routes>
          <Route path="/" element={<Home currentLang={currentLang} />} />
          <Route path="/about-us" element={<AboutUs currentLang={currentLang} />} />
          <Route path="/roadmap/:id" element={<Roadmap currentLang={currentLang} />} />
          <Route path="/login" element={<Login currentLang={currentLang} />} />
          <Route path="/signup" element={<SignUp currentLang={currentLang} />} />
          <Route path="/resetPassword" element={<ResetPassword currentLang={currentLang} />} />
          <Route path="/resetPasswordEmail" element={<ResetPasswordEmail currentLang={currentLang} />} />

          <Route path="/admin" element={<AdminLayout currentLang={currentLang} />}>
            <Route index element={<div><h2>Trang quản trị</h2><p>Vui lòng chọn một tùy chọn từ thanh bên.</p></div>} />
            <Route path="profile" element={<ProfilePage currentLang={currentLang} />} />
            <Route path="settings" element={<SettingsPage currentLang={currentLang} />} />
            <Route path="roadmaps-list" element={<RoadmapsPage currentLang={currentLang} />} />
            <Route path="edit-roadmap/:roadmapId" element={<EditRoadmapPage currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
            <Route path="users" element={<UserManagementPage currentLang={currentLang} />} />
            <Route path="activity" element={<ActivityPage currentLang={currentLang} />} />
          </Route>
        </Routes>

        <Footer currentLang={currentLang} />
      </Router>
    </AuthProvider>
  );
}