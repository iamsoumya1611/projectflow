import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import NotificationButton from './NotificationButton';

const Navbar = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Check if we're on login or register page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const openLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Close mobile menu when a link is clicked
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-[#1F1F2E] border-b border-[#2D2D44] sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo on the left */}
          <div className="flex-shrink-0 flex items-center">
            <Link to={isAdmin ? "/admin/dashboard" : "/dashboard"} className="text-[#4A90E2] font-bold text-2xl flex items-center">
              <i className="fas fa-project-diagram mr-2"></i>
              <span>ProjectFlow</span>
            </Link>
          </div>

          {/* Spacer to push nav to center */}
          <div className="flex-1"></div>

          {/* Navigation links in the center */}
          {!isAuthPage && user && (
            <div className="hidden lg:flex lg:items-center lg:space-x-8">
              {/* Regular user dashboard */}
              {!isAdmin ? (
                <Link
                  to="/dashboard"
                  className={`${isActive('/dashboard') ? 'border-[#4A90E2] text-white' : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-white'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                >
                  Dashboard
                </Link>
              ) : (
                // Admin dashboard
                <Link
                  to="/admin/dashboard"
                  className={`${isActive('/admin/dashboard') ? 'border-[#4A90E2] text-white' : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-white'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                >
                  Admin Dashboard
                </Link>
              )}

              <Link
                to={isAdmin ? "/admin/projects" : "/projects"}
                className={`${isActive(isAdmin ? '/admin/projects' : '/projects') ? 'border-[#4A90E2] text-white' : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-white'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                Projects
              </Link>
              <Link
                to={isAdmin ? "/admin/tasks" : "/tasks"}
                className={`${isActive(isAdmin ? '/admin/tasks' : '/tasks') ? 'border-[#4A90E2] text-white' : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-white'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                Tasks
              </Link>
              <Link
                to={isAdmin ? "/admin/reports" : "/reports"}
                className={`${isActive(isAdmin ? '/admin/reports' : '/reports') ? 'border-[#4A90E2] text-white' : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-white'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                Reports
              </Link>

              <Link
                to={isAdmin ? "/admin/gantt" : "/gantt"}
                className={`${isActive(isAdmin ? '/admin/gantt' : '/gantt') ? 'border-[#4A90E2] text-white' : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-white'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                Gantt
              </Link>
              
              <Link
                to={isAdmin ? "/admin/chat" : "/chat"}
                className={`${isActive(isAdmin ? '/admin/chat' : '/chat') ? 'border-[#4A90E2] text-white' : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-white'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                Chat
              </Link>
            </div>
          )}

          {/* Spacer to push user controls to right */}
          <div className="flex-1"></div>

          {/* User controls on the right */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            {user && !isAuthPage && <NotificationButton user={user} />}
            <div className="relative">
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-[#4A90E2] flex items-center justify-center">
                        <span className="text-white text-xl font-medium">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={openLogoutModal}
                      className="text-gray-300 hover:text-white text-sm font-medium flex items-center transition-colors duration-200"
                    >
                      <i className="fas fa-sign-out-alt text-xl mr-1"></i>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-gray-300 hover:text-white text-sm font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-[#4A90E2] hover:bg-[#3a7bc8] transition-colors duration-200"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-[#2D2D44] focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <i className="fas fa-times text-xl"></i>
              ) : (
                <i className="fas fa-bars text-xl"></i>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          {/* Only show navigation links if user is authenticated and not on auth pages */}
          {!isAuthPage && user ? (
            <>
              <div className="pt-2 pb-3 space-y-1">
                <Link
                  to={isAdmin ? "/admin/dashboard" : "/dashboard"}
                  className={`${isActive(isAdmin ? '/admin/dashboard' : '/dashboard') ? 'border-l-4 border-[#4A90E2] bg-[#2D2D44] text-white' : 'border-transparent text-gray-300 hover:bg-[#2D2D44] hover:border-gray-300 hover:text-white'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={handleLinkClick}
                >
                  {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                </Link>
                <Link
                  to={isAdmin ? "/admin/projects" : "/projects"}
                  className={`${isActive(isAdmin ? '/admin/projects' : '/projects') ? 'border-l-4 border-[#4A90E2] bg-[#2D2D44] text-white' : 'border-transparent text-gray-300 hover:bg-[#2D2D44] hover:border-gray-300 hover:text-white'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={handleLinkClick}
                >
                  Projects
                </Link>
                <Link
                  to={isAdmin ? "/admin/tasks" : "/tasks"}
                  className={`${isActive(isAdmin ? '/admin/tasks' : '/tasks') ? 'border-l-4 border-[#4A90E2] bg-[#2D2D44] text-white' : 'border-transparent text-gray-300 hover:bg-[#2D2D44] hover:border-gray-300 hover:text-white'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={handleLinkClick}
                >
                  Tasks
                </Link>
                <Link
                  to={isAdmin ? "/admin/reports" : "/reports"}
                  className={`${isActive(isAdmin ? '/admin/reports' : '/reports') ? 'border-l-4 border-[#4A90E2] bg-[#2D2D44] text-white' : 'border-transparent text-gray-300 hover:bg-[#2D2D44] hover:border-gray-300 hover:text-white'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={handleLinkClick}
                >
                  Reports
                </Link>
                <Link
                  to={isAdmin ? "/admin/gantt" : "/gantt"}
                  className={`${isActive(isAdmin ? '/admin/gantt' : '/gantt') ? 'border-l-4 border-[#4A90E2] bg-[#2D2D44] text-white' : 'border-transparent text-gray-300 hover:bg-[#2D2D44] hover:border-gray-300 hover:text-white'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={handleLinkClick}
                >
                  Gantt
                </Link>
                <Link
                  to={isAdmin ? "/admin/chat" : "/chat"}
                  className={`${isActive(isAdmin ? '/admin/chat' : '/chat') ? 'border-l-4 border-[#4A90E2] bg-[#2D2D44] text-white' : 'border-transparent text-gray-300 hover:bg-[#2D2D44] hover:border-gray-300 hover:text-white'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={handleLinkClick}
                >
                  Chat
                </Link>
              </div>
              <div className="pt-4 pb-3 border-t border-[#2D2D44]">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-[#4A90E2] flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user.name || 'User'}</div>
                    <div className="text-sm font-medium text-gray-400">{user.email || 'user@example.com'}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  <div className="px-3 py-2">
                    <NotificationButton user={user} />
                  </div>
                  <button
                    onClick={() => {
                      openLogoutModal();
                      handleLinkClick();
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-[#2D2D44]"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="pt-2 pb-3 space-y-1">
              <div className="pt-4 pb-3 border-t border-[#2D2D44]">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-[#2D2D44] flex items-center justify-center">
                      <i className="fas fa-user text-gray-400"></i>
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">Guest</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-[#2D2D44]"
                    onClick={handleLinkClick}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-[#2D2D44]"
                    onClick={handleLinkClick}
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1F1F2E] rounded-lg shadow-xl border border-[#2D2D44] p-6 w-96 max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Confirm Logout</h3>
              <button
                onClick={closeLogoutModal}
                className="text-gray-400 hover:text-white"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeLogoutModal}
                className="px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-white bg-[#1F1F2E] hover:bg-[#2D2D44]"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Yes, logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;