import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Footer from './components/Footer';
import BrowseOpenings from './pages/BrowseOpenings';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Login from './pages/Login';
import Register from './pages/Register';
import JuniorDashboard from './pages/JuniorDashboard';
import SeniorDashboard from './pages/SeniorDashboard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Community from './pages/Community';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App flex flex-col min-h-screen">
          {/* Navbar always visible */}
          <Navbar />

          {/* Main content */}
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/browse-openings" element={<BrowseOpenings />} />
              <Route path = "/community" element = {<Community />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/junior-dashboard" 
                element={
                  <ProtectedRoute requiredRole="junior">
                    <JuniorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/senior-dashboard" 
                element={
                  <ProtectedRoute requiredRole="senior">
                    <SeniorDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>

          {/* Footer visible everywhere except Login & Register (handled inside Footer.jsx) */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
