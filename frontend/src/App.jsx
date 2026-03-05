import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/AuthRoutes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CoursePage from './pages/CoursePage';
import AdminDashboard from './pages/AdminDashboard'; // We will create this
import PaymentPage from './pages/PaymentPage';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app-wrapper">
                    <Navbar />
                    <main>
                        <Routes>
                            {/* Redirect root to Login or Dashboard based on auth */}
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />

                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Protected Routes */}
                            <Route path="/dashboard/*" element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } />
                            <Route path="/home" element={
                                <ProtectedRoute>
                                    <LandingPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/course/:id" element={
                                <ProtectedRoute>
                                    <CoursePage />
                                </ProtectedRoute>
                            } />
                            <Route path="/payment/:id" element={
                                <ProtectedRoute>
                                    <PaymentPage />
                                </ProtectedRoute>
                            } />

                            {/* Admin Protected Routes */}
                            <Route path="/admin/*" element={
                                <AdminRoute>
                                    <AdminDashboard />
                                </AdminRoute>
                            } />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
