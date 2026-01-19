import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, setUser } = useAuth(); // Make sure setUser is exported from your AuthContext
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize form state with user data
  const [formData, setFormData] = useState({
    name: user?.name || '',
    skills: user?.skills?.join(', ') || '',
    experience: user?.experience || '',
    projectsCompleted: user?.projectsCompleted || 0,
    githubUrl: user?.githubUrl || '',
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!user) return <div className="text-center p-5">Loading profile...</div>;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setProfilePictureFile(e.target.files[0]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (profilePictureFile) {
      data.append('profilePicture', profilePictureFile);
    }
    try {
      const response = await axios.put('http://localhost:5000/api/auth/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (setUser) setUser(response.data.user); 
      setIsEditing(false);
      setProfilePictureFile(null);
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile.');
    }
    setLoading(false);
  };
  
  const serverUrl = 'http://localhost:5000';

  return (
    <div className="container mt-4 mb-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-5">
              {!isEditing ? (
                // --- VIEW MODE ---
                <>
                  <div className="text-center mb-4">
                    {user.profilePicturePath ? (
                      <img src={`${serverUrl}/${user.profilePicturePath.replace(/\\/g, '/')}`} alt="Profile" className="rounded-circle mx-auto mb-3" style={{ width: '120px', height: '120px', objectFit: 'cover' }} />
                    ) : (
                      <div className="bg-primary rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px' }}><i className="bi bi-person-fill display-3 text-white"></i></div>
                    )}
                    <h2 className="fw-bold">{user.name}</h2>
                    <p className="text-muted mb-2">{user.email}</p>
                    <span className={`badge fs-6 ${user.userType === 'senior' ? 'bg-success' : 'bg-primary'}`}>{user.userType} Developer</span>
                  </div>
                  <div className="row">
                    <div className="col-md-6"><h5 className="fw-bold mb-3"><i className="bi bi-gear-fill me-2 text-primary"></i>Skills</h5>{user.skills && user.skills.length > 0 ? (<div className="d-flex flex-wrap gap-2 mb-4">{user.skills.map((skill, index) => (<span key={index} className="badge bg-light text-dark p-2">{skill}</span>))}</div>) : (<p className="text-muted mb-4">No skills added.</p>)}</div>
                    <div className="col-md-6"><h5 className="fw-bold mb-3"><i className="bi bi-briefcase-fill me-2 text-primary"></i>Experience</h5><p className="text-muted mb-4">{user.experience || 'No experience added.'}</p></div>
                  </div>
                  <div className="border-top pt-4">
                    <div className="row text-center">
                      <div className="col-md-4"><h4 className="fw-bold text-primary">{user.projectsCompleted}</h4><p className="text-muted mb-0">Projects Done</p></div>
                      <div className="col-md-4"><a href={user.githubUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-decoration-none"><h4 className="fw-bold text-dark"><i className="bi bi-github"></i></h4><p className="text-muted mb-0">GitHub</p></a></div>
                      <div className="col-md-4"><a href={`${serverUrl}/${user.resumePath?.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none"><h4 className="fw-bold text-info"><i className="bi bi-file-earmark-person"></i></h4><p className="text-muted mb-0">Resume</p></a></div>
                    </div>
                  </div>
                  <div className="text-center mt-4 pt-3 border-top">
                    <button className="btn btn-primary" onClick={() => setIsEditing(true)}><i className="bi bi-pencil-square me-2"></i>Edit Profile</button>
                  </div>
                </>
              ) : (
                // --- EDIT MODE ---
                <form onSubmit={handleUpdateProfile}>
                  <h3 className="fw-bold mb-4">Edit Your Profile</h3>
                  <div className="mb-3"><label className="form-label">Full Name</label><input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} /></div>
                  <div className="mb-3"><label className="form-label">Email (cannot be changed)</label><input type="email" className="form-control" value={user.email} disabled /></div>
                  <div className="mb-3"><label className="form-label">Skills (comma-separated)</label><input type="text" className="form-control" name="skills" value={formData.skills} onChange={handleChange} /></div>
                  <div className="mb-3"><label className="form-label">Experience</label><textarea className="form-control" name="experience" rows="3" value={formData.experience} onChange={handleChange}></textarea></div>
                  <div className="row mb-3">
                    <div className="col-md-6"><label className="form-label">Projects Completed</label><input type="number" className="form-control" name="projectsCompleted" value={formData.projectsCompleted} onChange={handleChange} min="0"/></div>
                    <div className="col-md-6"><label className="form-label">GitHub URL</label><input type="url" className="form-control" name="githubUrl" value={formData.githubUrl} onChange={handleChange}/></div>
                  </div>
                  <div className="mb-4"><label className="form-label">Update Profile Picture (JPG/PNG)</label><input type="file" className="form-control" name="profilePicture" accept="image/jpeg, image/png" onChange={handleFileChange} /></div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;