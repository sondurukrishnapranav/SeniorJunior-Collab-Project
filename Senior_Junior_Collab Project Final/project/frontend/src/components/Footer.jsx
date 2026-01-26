import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaLinkedin, FaInstagram, FaTwitter } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-dark text-light pt-5 pb-3 mt-5">
      <Container>
        <Row className="mb-4">
          {/* Brand */}
          <Col md={3} className="mb-3">
            <h4 className="fw-bold">CollabHub</h4>
            <p className="text-muted">
              A platform where juniors meet seniors, collaborate, and grow
              together
            </p>
          </Col>

          {/* Quick Links */}
          <Col md={3} className="mb-3">
            <h5 className="fw-bold border-bottom pb-2">Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-decoration-none text-light">Home</a></li>
              <li><a href="/browse-openings" className="text-decoration-none text-light">Browse Openings</a></li>
              <li><a href="/about" className="text-decoration-none text-light">About Us</a></li>
              <li><a href="/contact" className="text-decoration-none text-light">Contact</a></li>
            </ul>
          </Col>

          {/* Resources */}
          <Col md={3} className="mb-3">
            <h5 className="fw-bold border-bottom pb-2">Resources</h5>
            <ul className="list-unstyled">
              <li><a href="/login" className="text-decoration-none text-light">Login</a></li>
              <li><a href="/register" className="text-decoration-none text-light">Register</a></li>
              <li><a href="/junior-dashboard" className="text-decoration-none text-light">Junior Dashboard</a></li>
              <li><a href="/senior-dashboard" className="text-decoration-none text-light">Senior Dashboard</a></li>
            </ul>
          </Col>

          {/* Connect */}
          <Col md={3} className="mb-3">
            <h5 className="fw-bold border-bottom pb-2">Connect</h5>
            <div className="d-flex gap-3">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-light fs-4">
                <FaLinkedin />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-light fs-4">
                <FaInstagram />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-light fs-4">
                <FaTwitter />
              </a>
            </div>
          </Col>
        </Row>

        {/* Bottom Note */}
        <Row>
          <Col className="text-center text-muted">
            <hr className="border-secondary" />
            <p className="mb-0">
              © {new Date().getFullYear()} CollabHub. Built with ❤️ by your team.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
