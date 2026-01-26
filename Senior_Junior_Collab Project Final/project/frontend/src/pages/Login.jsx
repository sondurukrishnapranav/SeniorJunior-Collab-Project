import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  // ✅ UPDATED: Removed 'userType' from state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // ✅ UPDATED: We only pass email and password
    const result = await login(formData.email, formData.password);

    if (result.success) {
      // ✅ CRITICAL: We check the role from the BACKEND RESPONSE, not the form data
      // result.user must be returned by your AuthContext's login function
      const role = result.user?.userType;

      if (role === 'junior') {
        navigate('/junior-dashboard');
      } else if (role === 'senior') {
        navigate('/senior-dashboard');
      } else {
        // Fallback for safety
        setError("Account role not recognized.");
      }
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card border-0 shadow-lg rounded-4">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary">Welcome Back</h2>
                <p className="text-muted">Enter your credentials to access your dashboard</p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-circle me-2"></i>{error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* ✅ UPDATED: Radio buttons for User Type are GONE */}

                <div className="mb-3">
                  <label className="form-label fw-semibold">Email Address</label>
                  <input
                    type="email"
                    className="form-control form-control-lg bg-light"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Password</label>
                  <input
                    type="password"
                    className="form-control form-control-lg bg-light"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 btn-lg mb-3 shadow-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="d-flex justify-content-between align-items-center mt-4">
                <Link to="/forgot-password" class="text-decoration-none text-muted small">Forgot Password?</Link>
                <p className="mb-0 text-muted small">
                  New here? <Link to="/register" className="text-primary text-decoration-none fw-bold">Create Account</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;