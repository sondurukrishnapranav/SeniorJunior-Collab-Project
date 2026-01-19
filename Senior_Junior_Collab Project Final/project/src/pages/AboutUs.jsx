import React from 'react';

const AboutUs = () => {
  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold mb-4">About Senior-Junior Collab</h1>
            <p className="lead text-muted">
              Bridging the gap between experienced developers and emerging talent
            </p>
          </div>

          <div className="row mb-5">
            <div className="col-md-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="text-primary mb-3">
                    <i className="bi bi-lightbulb display-4"></i>
                  </div>
                  <h4 className="fw-bold mb-3">Our Mission</h4>
                  <p className="text-muted">
                    We believe that the best learning happens through collaboration. Our platform 
                    connects junior developers eager to learn with senior developers looking to 
                    share their knowledge while getting help with their projects.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="text-success mb-3">
                    <i className="bi bi-target display-4"></i>
                  </div>
                  <h4 className="fw-bold mb-3">Our Vision</h4>
                  <p className="text-muted">
                    To create a thriving ecosystem where knowledge flows freely, projects get 
                    completed efficiently, and both junior and senior developers grow together 
                    through meaningful collaboration.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-light rounded-4 p-5 mb-5">
            <h3 className="fw-bold mb-4 text-center">How We Help</h3>
            <div className="row">
              <div className="col-md-6 mb-4">
                <h5 className="fw-bold text-primary">
                  <i className="bi bi-person-check me-2"></i>
                  For Senior Developers
                </h5>
                <ul className="list-unstyled">
                  <li><i className="bi bi-check-circle text-success me-2"></i>Get help with your projects</li>
                  <li><i className="bi bi-check-circle text-success me-2"></i>Share your knowledge and experience</li>
                  <li><i className="bi bi-check-circle text-success me-2"></i>Build a network of talented developers</li>
                  <li><i className="bi bi-check-circle text-success me-2"></i>Give back to the developer community</li>
                </ul>
              </div>
              <div className="col-md-6 mb-4">
                <h5 className="fw-bold text-primary">
                  <i className="bi bi-person-plus me-2"></i>
                  For Junior Developers
                </h5>
                <ul className="list-unstyled">
                  <li><i className="bi bi-check-circle text-success me-2"></i>Work on real-world projects</li>
                  <li><i className="bi bi-check-circle text-success me-2"></i>Learn from experienced mentors</li>
                  <li><i className="bi bi-check-circle text-success me-2"></i>Build your portfolio and skills</li>
                  <li><i className="bi bi-check-circle text-success me-2"></i>Network with industry professionals</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row mb-5">
            <div className="col-12">
              <h3 className="fw-bold mb-4 text-center">Our Values</h3>
            </div>
            <div className="col-md-4 text-center mb-4">
              <div className="p-4">
                <div className="text-primary mb-3">
                  <i className="bi bi-people-fill display-3"></i>
                </div>
                <h5 className="fw-bold">Collaboration</h5>
                <p className="text-muted">
                  We believe in the power of working together to achieve greater results.
                </p>
              </div>
            </div>
            <div className="col-md-4 text-center mb-4">
              <div className="p-4">
                <div className="text-warning mb-3">
                  <i className="bi bi-book display-3"></i>
                </div>
                <h5 className="fw-bold">Learning</h5>
                <p className="text-muted">
                  Continuous learning and growth for developers at all skill levels.
                </p>
              </div>
            </div>
            <div className="col-md-4 text-center mb-4">
              <div className="p-4">
                <div className="text-success mb-3">
                  <i className="bi bi-heart display-3"></i>
                </div>
                <h5 className="fw-bold">Community</h5>
                <p className="text-muted">
                  Building a supportive and inclusive developer community.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="fw-bold mb-3">Ready to Join Us?</h3>
            <p className="lead mb-4">
              Whether you're a senior developer looking to share knowledge or a junior developer 
              eager to learn, we'd love to have you in our community.
            </p>
            <a href="/register" className="btn btn-primary btn-lg">
              Get Started Today
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;