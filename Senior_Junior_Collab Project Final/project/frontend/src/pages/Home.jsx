import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h1 className="display-4 fw-bold">
                Senior-Junior Collab
              </h1>
              <p className="lead">
                Connect talented junior developers with experienced seniors to collaborate 
                on exciting projects and accelerate learning.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                {!user ? (
                  <>
                    <Link to="/register" className="btn btn-light btn-lg">
                      Get Started
                    </Link>
                    <Link to="/browse-openings" className="btn btn-outline-light btn-lg">
                      Browse Projects
                    </Link>
                  </>
                ) : (
                  <Link 
                    to={user.userType === 'junior' ? '/junior-dashboard' : '/senior-dashboard'} 
                    className="btn btn-light btn-lg"
                  >
                    Go to Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-lg-12">
              <h2 className="display-5 fw-bold mb-4">How It Works</h2>
              <p className="lead text-muted">
                Simple steps to connect and collaborate
              </p>
            </div>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card feature-card h-100 text-center p-4">
                <div className="feature-icon">
                  <i className="bi bi-person-plus"></i>
                </div>
                <h4 className="fw-bold mb-3">1. Create Account</h4>
                <p className="text-muted">
                  Sign up as either a senior developer looking for help or a junior 
                  developer eager to learn and contribute.
                </p>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card feature-card h-100 text-center p-4">
                <div className="feature-icon">
                  <i className="bi bi-search"></i>
                </div>
                <h4 className="fw-bold mb-3">2. Find Projects</h4>
                <p className="text-muted">
                  Seniors post project openings, juniors browse and apply to 
                  projects that match their skills and interests.
                </p>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card feature-card h-100 text-center p-4">
                <div className="feature-icon">
                  <i className="bi bi-people"></i>
                </div>
                <h4 className="fw-bold mb-3">3. Collaborate</h4>
                <p className="text-muted">
                  Work together on real projects, share knowledge, and build 
                  amazing things while learning from each other.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-3">
              <div className="stats-card">
                <div className="stats-number">500+</div>
                <h5>Active Users</h5>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stats-card">
                <div className="stats-number">150+</div>
                <h5>Projects Completed</h5>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stats-card">
                <div className="stats-number">80+</div>
                <h5>Senior Mentors</h5>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stats-card">
                <div className="stats-number">420+</div>
                <h5>Junior Developers</h5>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h2 className="display-5 fw-bold mb-4">Ready to Start Collaborating?</h2>
              <p className="lead mb-4">
                Join our community and take the next step in your development journey.
              </p>
              {!user && (
                <Link to="/register" className="btn btn-primary btn-lg">
                  Join Now - It's Free!
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;