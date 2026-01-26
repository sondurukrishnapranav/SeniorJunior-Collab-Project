import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api'; // ✅ Import api

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    userType: 'junior', skills: '', experience: '',
    projectsCompleted: 0, githubUrl: '',
    resume: null, profilePicture: null
  });
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(300);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => { /* ... timer logic remains same ... */ }, [isVerificationStep]);
  
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.files[0] });

  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.userType === 'senior' && formData.projectsCompleted < 6) {
      return setError('Seniors must have completed at least 6 projects.');
    }
    if (!formData.resume) {
      return setError('A resume (PDF) is required to register.');
    }

    setLoading(true);
    const formDataObj = new FormData();
    Object.keys(formData).forEach(key => formDataObj.append(key, formData[key]));

    try {
      // ✅ Use api instance
      const response = await api.post('/auth/register', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(response.data.message);
      setIsVerificationStep(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };
  
  const handleResendOTP = async () => { /* ... logic ... */ };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // ✅ Use api instance
      const response = await api.post('/auth/verify-email', { email: formData.email, otp });
      localStorage.setItem('token', response.data.token);
      window.location.href = response.data.user.userType === 'junior' ? '/junior-dashboard' : '/senior-dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-5">
              {!isVerificationStep ? (
                <>
                  <div className="text-center mb-4"><h2 className="fw-bold">Create Account</h2><p className="text-muted">Join our community of developers</p></div>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <form onSubmit={handleSubmitDetails}>
                    {/* ... form fields same as before ... */}
                    <div className="mb-3"><label className="form-label">I am a</label><div className="row"><div className="col-6"><div className="form-check"><input className="form-check-input" type="radio" name="userType" value="junior" id="juniorReg" checked={formData.userType === 'junior'} onChange={handleChange} /><label className="form-check-label" htmlFor="juniorReg">Junior Developer</label></div></div><div className="col-6"><div className="form-check"><input className="form-check-input" type="radio" name="userType" value="senior" id="seniorReg" checked={formData.userType === 'senior'} onChange={handleChange} /><label className="form-check-label" htmlFor="seniorReg">Senior Developer</label></div></div></div></div>
                    <div className="row mb-3"><div className="col-md-6"><label className="form-label">Full Name *</label><input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required /></div><div className="col-md-6"><label className="form-label">Email Address *</label><input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required /></div></div>
                    <div className="row mb-3"><div className="col-md-6"><label className="form-label">Password *</label><input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required /></div><div className="col-md-6"><label className="form-label">Confirm Password *</label><input type="password" className="form-control" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required /></div></div>
                    <div className="row mb-3"><div className="col-md-6"><label className="form-label">Projects Completed *</label><input type="number" className="form-control" name="projectsCompleted" value={formData.projectsCompleted} onChange={handleChange} required min="0"/><div className="form-text">Seniors need at least 6.</div></div><div className="col-md-6"><label className="form-label">GitHub URL</label><input type="url" className="form-control" name="githubUrl" value={formData.githubUrl} onChange={handleChange} placeholder="https://github.com/username"/></div></div>
                    <div className="mb-3"><label className="form-label">Skills</label><input type="text" className="form-control" name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js (comma-separated)" /></div>
                    <div className="mb-4"><label className="form-label">Experience</label><textarea className="form-control" name="experience" rows="3" value={formData.experience} onChange={handleChange} placeholder="Tell us about your experience..."></textarea></div>
                    <div className="row mb-4"><div className="col-md-6"><label className="form-label">Profile Picture (Optional)</label><input type="file" className="form-control" name="profilePicture" accept="image/jpeg, image/png" onChange={handleFileChange} /></div><div className="col-md-6"><label className="form-label">Resume (PDF) *</label><input type="file" className="form-control" name="resume" accept=".pdf" onChange={handleFileChange} required /></div></div>
                    <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>{loading ? 'Sending OTP...' : 'Continue'}</button>
                  </form>
                </>
              ) : (
                <>
                  <div className="text-center mb-4"><h2 className="fw-bold">Verify Your Email</h2><p className="text-muted">Enter the 6-digit code sent to <strong>{formData.email}</strong></p></div>
                  {message && <div className="alert alert-success">{message}</div>}
                  {error && <div className="alert alert-danger">{error}</div>}
                  <form onSubmit={handleVerifyOTP}>
                    <div className="mb-3"><label className="form-label">Verification Code</label><input type="text" className="form-control" value={otp} onChange={(e) => setOtp(e.target.value)} required /></div>
                    <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>{loading ? 'Verifying...' : 'Verify & Create Account'}</button>
                    <button type="button" className="btn btn-link w-100" onClick={handleResendOTP} disabled={resendDisabled}>{resendDisabled ? `Resend OTP in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : 'Resend OTP'}</button>
                  </form>
                </>
              )}
              <div className="text-center mt-3"><p className="text-muted">Already have an account? <Link to="/login">Sign in here</Link></p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;