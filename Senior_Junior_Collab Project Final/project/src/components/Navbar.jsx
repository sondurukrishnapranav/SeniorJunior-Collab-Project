import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // ✅ redirect to login after logout
  };

  const getDashboardLink = () => {
    if (user?.userType === 'junior') return '/junior-dashboard';
    if (user?.userType === 'senior') return '/senior-dashboard';
    return '/';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 sticky-top">
      <div className="container">
        {/* Logo / Brand */}
        <Link className="navbar-brand fw-bold d-flex align-items-center text-primary" to="/">
          <i className="bi bi-people-fill me-2 fs-4"></i>
          <span>Senior-Junior Collab</span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links */}
        <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
          <ul className="navbar-nav mx-auto gap-3">
            <li className="nav-item">
              <Link className="nav-link fw-semibold d-flex align-items-center" to="/">
                <i className="bi bi-house-door me-2"></i> Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold d-flex align-items-center" to="/browse-openings">
                <i className="bi bi-binoculars me-2"></i> Browse Openings
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold d-flex align-items-center" to="/community">
                <i className="bi bi-envelope me-2"></i> Community
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold d-flex align-items-center" to="/about">
                <i className="bi bi-info-circle me-2"></i> About Us
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold d-flex align-items-center" to="/contact">
                <i className="bi bi-envelope me-2"></i> Contact
              </Link>
            </li>
          </ul>

          {/* Right Side Auth Section */}
          <ul className="navbar-nav ms-auto d-flex align-items-center gap-2">
            {user ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle fw-semibold d-flex align-items-center"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-person-circle me-2 fs-5"></i> {user.name}
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item d-flex align-items-center" to="/profile">
                      <i className="bi bi-person me-2"></i> Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center" to={getDashboardLink()}>
                      <i className="bi bi-speedometer2 me-2"></i> Dashboard
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button
                      className="dropdown-item text-danger d-flex align-items-center"
                      type="button"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li>
                  <Link className="btn btn-outline-primary fw-semibold px-3 d-flex align-items-center gap-2" to="/login">
                    <i className="bi bi-box-arrow-in-right"></i> Login
                  </Link>
                </li>
                <li>
                  <Link className="btn btn-primary fw-semibold px-3 d-flex align-items-center gap-2" to="/register">
                    <i className="bi bi-person-plus"></i> Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
