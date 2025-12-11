import { useState, useEffect } from 'react';
import { Calendar, Home, Settings, Menu, X, MapPin, Phone, Mail, Clock, Users, Trophy, Zap } from 'lucide-react';
import BookingPage from './pages/BookingPage';
import AdminDashboard from './pages/AdminDashboard';
import { courtsAPI } from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState('booking');
  const [courts, setCourts] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    loadCourts();
  }, []);

  const loadCourts = async () => {
    try {
      const response = await courtsAPI.getAll({ active: true });
      setCourts(response.data);
    } catch (error) {
      console.error('Failed to load courts:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    SportsHub Pro
                  </h1>
                  <p className="text-xs text-gray-500">Premium Facility Booking</p>
                </div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage('booking')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === 'booking'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Book Court</span>
              </button>
              <button
                onClick={() => setCurrentPage('admin')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === 'admin'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => {
                  setCurrentPage('booking');
                  setIsMenuOpen(false);
                }}
                className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === 'booking'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Book Court</span>
              </button>
              <button
                onClick={() => {
                  setCurrentPage('admin');
                  setIsMenuOpen(false);
                }}
                className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === 'admin'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {currentPage === 'booking' ? 'Book Your Perfect Court' : 'Manage Your Facility'}
            </h2>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              {currentPage === 'booking' 
                ? 'Experience premium sports facilities with real-time availability and dynamic pricing'
                : 'Comprehensive dashboard for managing courts, bookings, and facility operations'
              }
            </p>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold">{courts.length}</div>
              <div className="text-sm opacity-75">Courts Available</div>
            </div>
            <div className="text-center border-l border-r border-white/20">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm opacity-75">Booking Access</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">Instant</div>
              <div className="text-sm opacity-75">Confirmation</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {currentPage === 'booking' ? (
            <BookingPage courts={courts} refreshCourts={loadCourts} />
          ) : (
            <AdminDashboard courts={courts} refreshCourts={loadCourts} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="w-6 h-6 text-blue-400" />
                <span className="text-lg font-bold">SportsHub Pro</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your premium destination for sports facility booking with advanced scheduling and management features.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  About Us
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Facilities
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Pricing
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Contact
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <Mail className="w-4 h-4" />
                  <span>info@sportshubpro.com</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>123 Sports Complex Ave</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Mon-Sun: 6AM - 11PM</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              2024 SportsHub Pro. All rights reserved. Built with for sports enthusiasts.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
