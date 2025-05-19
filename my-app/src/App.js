import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import Layout Component (nếu bạn đang dùng)
// import MainLayout from './layouts/MainLayout';

// Import component Header và Footer
import Header from './components/Header/header';
import Footer from "./components/Footer/footer";
import 'bootstrap/dist/css/bootstrap.min.css'

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
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider

export default function App() {
  return (
    // Bọc toàn bộ ứng dụng bằng LanguageProvider và AuthProvider
    <LanguageProvider>
      <AuthProvider>
        <Router>
          {/*
            Đặt Header và Footer ở đây (bên ngoài Routes)
            để chúng hiển thị trên MỌI route.
          */}
          <Header />

          <Routes>
            {/* Các Route của ứng dụng */}
            <Route path="/" element={<Home />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/roadmap/:id" element={<Roadmap />} />

            {/* Các route không cần Header/Footer nếu bạn dùng Layout Component */}
            {/* Nếu không dùng Layout, Header/Footer vẫn hiển thị ở đây */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/resetPassword" element={<ResetPassword />} />
            <Route path="/resetPasswordEmail" element={<ResetPasswordEmail />} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminPage />}>
               <Route path="profile" element={<ProfilePage />} />
               <Route path="settings" element={<SettingsPage />} />
               <Route path="roadmaps-list" element={<RoadmapsPage />} />
               <Route path="edit-roadmap" element={<EditRoadmapPage />} />
               <Route path="users" element={<UserManagementPage />} />
               <Route path="activity" element={<ActivityPage />} /> {/* Added ActivityPage under /admin */}
            </Route>

            {/* ... các route khác ... */}
          </Routes>

          <Footer />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}