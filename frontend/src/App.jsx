import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [cart, setCart] = useState({});

  const cartItemCount = Object.values(cart).reduce((a, b) => a + b, 0);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (user, token) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setCart({});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Router>
      {token && (
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          currentTheme={currentTheme}
          setCurrentTheme={setCurrentTheme}
          cartItemCount={cartItemCount}
        />
      )}
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
        <Route 
          path="/" 
          element={
            token ? (
              <Dashboard 
                user={user} 
                currentTheme={currentTheme}
                cart={cart}
                setCart={setCart}
              />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route path="/admin" element={token && user?.is_admin ? <AdminPanel user={user} currentTheme={currentTheme} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
