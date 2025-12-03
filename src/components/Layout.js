import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">Finxt Admin</div>
        <div className="navbar-menu">
          <Link to="/blogs" className="navbar-item">Blogs</Link>
          <Link to="/blogs/create" className="navbar-item">Create Blog</Link>
          <button onClick={handleLogout} className="navbar-item logout-btn">Logout</button>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
