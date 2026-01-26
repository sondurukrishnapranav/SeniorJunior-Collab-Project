import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission (would typically send to backend)
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold mb-4">Contact Us</h1>
            <p className="lead text-muted">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="row">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-5">
                  <h3 className="fw-bold mb-4">Send us a Message</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Subject *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="form-label">Message *</label>
                      <textarea
                        className="form-control"
                        name="message"
                        rows="5"
                        value={formData.message}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg">
                      <i className="bi bi-send me-2"></i>Send Message
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h4 className="fw-bold mb-4">Get in Touch</h4>
                  
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-envelope text-primary me-3"></i>
                      <h6 className="fw-bold mb-0">Email</h6>
                    </div>
                    <p className="text-muted ms-4">support@seniorjuniorcollab.com</p>
                  </div>

                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-chat-dots text-primary me-3"></i>
                      <h6 className="fw-bold mb-0">Live Chat</h6>
                    </div>
                    <p className="text-muted ms-4">Available 9 AM - 6 PM EST</p>
                  </div>

                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-question-circle text-primary me-3"></i>
                      <h6 className="fw-bold mb-0">FAQ</h6>
                    </div>
                    <p className="text-muted ms-4">Find answers to common questions</p>
                  </div>

                  <div className="border-top pt-4">
                    <h6 className="fw-bold mb-3">Follow Us</h6>
                    <div className="d-flex gap-3">
                      <a href="#" className="text-primary">
                        <i className="bi bi-twitter fs-4"></i>
                      </a>
                      <a href="#" className="text-primary">
                        <i className="bi bi-linkedin fs-4"></i>
                      </a>
                      <a href="#" className="text-primary">
                        <i className="bi bi-github fs-4"></i>
                      </a>
                      <a href="#" className="text-primary">
                        <i className="bi bi-discord fs-4"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;