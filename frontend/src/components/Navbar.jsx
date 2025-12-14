import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-3xl font-bold flex items-center gap-2">
            🍬 Sweet Shop
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-2xl"
          >
            ☰
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6">
            <span className="text-sm font-medium">
              Welcome, {user?.full_name || user?.email}
            </span>
            {user?.is_admin && (
              <Link
                to="/admin"
                className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Admin Panel
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition font-semibold"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4">
            <p className="text-sm font-medium px-2">{user?.full_name || user?.email}</p>
            {user?.is_admin && (
              <Link
                to="/admin"
                className="block px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100"
              >
                Admin Panel
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition font-semibold"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
