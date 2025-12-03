import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import BlogList from './pages/BlogList';
import BlogCreate from './pages/BlogCreate';
import BlogEdit from './pages/BlogEdit';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><BlogList /></PrivateRoute>} />
        <Route path="/blogs" element={<PrivateRoute><BlogList /></PrivateRoute>} />
        <Route path="/blogs/create" element={<PrivateRoute><BlogCreate /></PrivateRoute>} />
        <Route path="/blogs/edit/:id" element={<PrivateRoute><BlogEdit /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/blogs" />} />
      </Routes>
    </Router>
  );
}

export default App;
