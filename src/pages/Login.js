import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateAdmin = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log('Creating admin user...');
      const response = await axios.post('http://localhost:5000/api/auth/reset-admin');
      
      console.log('Admin creation response:', response.data);
      
      if (response.data.success) {
        setSuccess(`Admin created! Email: ${response.data.credentials.email}, Password: ${response.data.credentials.password}`);
        setEmail(response.data.credentials.email);
        setPassword(response.data.credentials.password);
      }
    } catch (err) {
      console.error('Create admin error:', err);
      setError('Failed to create admin: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAdmin = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/check-admin');
      console.log('Admins in database:', response.data);
      alert(`Total admins: ${response.data.count}\nAdmins: ${JSON.stringify(response.data.admins, null, 2)}`);
    } catch (err) {
      console.error('Check admin error:', err);
      alert('Error checking admins: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    console.log('Attempting login with:', { email, password });

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Login response:', response.data);

      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('admin', JSON.stringify(response.data.admin));
        console.log('Login successful, redirecting...');
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => navigate('/blogs'), 1000);
      } else {
        setError('Login failed - no token received');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      
      // If admin not found, suggest creating admin
      if (errorMessage.includes('Invalid email or password')) {
        setError(errorMessage + ' - Click "Create Admin User" button below');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Admin Login</h1>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message" style={{ 
            padding: '10px', 
            marginBottom: '15px', 
            backgroundColor: '#fee', 
            color: '#c00',
            borderRadius: '4px',
            border: '1px solid #fcc'
          }}>{error}</div>}
          
          {success && <div className="success-message" style={{ 
            padding: '10px', 
            marginBottom: '15px', 
            backgroundColor: '#efe', 
            color: '#0a0',
            borderRadius: '4px',
            border: '1px solid #cfc'
          }}>{success}</div>}
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              placeholder="Enter email"
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div style={{ marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
            <strong>First time setup?</strong>
          </p>
          <button 
            onClick={handleCreateAdmin} 
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            Create Admin User
          </button>
          
          <button 
            onClick={handleCheckAdmin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            Check Admin Status
          </button>
        </div>

        <div style={{ marginTop: '20px', fontSize: '12px', color: '#666', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>First time setup instructions:</p>
          <p style={{ margin: '5px 0', fontSize: '11px' }}>
            1. Click "Create Admin User" to set up your admin account
          </p>
          <p style={{ margin: '5px 0', fontSize: '11px' }}>
            2. Click "Check Admin Status" to verify the account was created
          </p>
          <p style={{ margin: '5px 0', fontSize: '11px' }}>
            3. Login credentials will be auto-filled after creation
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
