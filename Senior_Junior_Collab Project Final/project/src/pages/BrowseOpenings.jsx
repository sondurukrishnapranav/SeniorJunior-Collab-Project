import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const BrowseOpenings = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // States for application modal
  const [applicationData, setApplicationData] = useState({ coverLetter: '', portfolioUrl: '' });
  const [resumeFile, setResumeFile] = useState(null);
  
  // ✨ NEW: States for filtering
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [filteredProjects, setFilteredProjects] = useState([]);

  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);
  
  // ✨ NEW: Effect to filter projects whenever the main list or selected skill changes
  useEffect(() => {
    if (!selectedSkill) {
      setFilteredProjects(projects); // If no skill is selected, show all projects
    } else {
      const filtered = projects.filter(project => 
        project.requiredSkills.includes(selectedSkill)
      );
      setFilteredProjects(filtered);
    }
  }, [selectedSkill, projects]);


  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects');
      const fetchedProjects = response.data;
      setProjects(fetchedProjects);
      
      // ✨ NEW: Dynamically generate the list of unique skills for the filter bar
      const skills = new Set(fetchedProjects.flatMap(p => p.requiredSkills));
      setAllSkills(['All Projects', ...skills]);

    } catch (error) {
      console.error('Error fetching projects:', error);
    }
    setLoading(false);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to apply for projects');
    if (!resumeFile) return alert('Please upload your resume in PDF format.');

    const formData = new FormData();
    formData.append('projectId', selectedProject._id);
    formData.append('coverLetter', applicationData.coverLetter);
    formData.append('portfolioUrl', applicationData.portfolioUrl);
    formData.append('resume', resumeFile);

    try {
      await axios.post('http://localhost:5000/api/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Application submitted successfully!');
      
      const modalElement = document.getElementById('applicationModal');
      if (modalElement && window.bootstrap) {
        const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();
      }
      
      setSelectedProject(null);
      setApplicationData({ coverLetter: '', portfolioUrl: '' });
      setResumeFile(null);
      const fileInput = document.querySelector('input[type="file"]');
      if(fileInput) fileInput.value = '';
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit application');
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const colors = { 'Beginner': 'success', 'Intermediate': 'warning', 'Advanced': 'danger' };
    return colors[difficulty] || 'secondary';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        {/* --- ✨ NEW: Filter Sidebar --- */}
        <aside className="col-lg-2 col-md-3">
          <div className="sticky-top" style={{ top: '6rem' }}>
            <h5 className="fw-bold mb-3">Filter by Domain</h5>
            <div className="list-group">
              {allSkills.map(skill => (
                <button
                  key={skill}
                  type="button"
                  className={`list-group-item list-group-item-action ${selectedSkill === skill || (skill === 'All Projects' && !selectedSkill) ? 'active' : ''}`}
                  onClick={() => setSelectedSkill(skill === 'All Projects' ? null : skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* --- Main Content Area --- */}
        <main className="col-lg-10 col-md-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold">Browse Project Openings</h2>
            <span className="badge bg-primary fs-6">{filteredProjects.length} Projects Found</span>
          </div>

          <div className="row">
            {filteredProjects.length === 0 ? (
              <div className="col-12 text-center">
                <div className="card p-5 shadow-sm">
                  <i className="bi bi-inbox display-1 text-muted mb-3"></i>
                  <h4>No Projects Available for this Domain</h4>
                  <p className="text-muted">Try selecting another filter or check back later!</p>
                </div>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div key={project._id} className="col-lg-4 col-md-6 mb-4">
                  <div className="card project-card h-100 shadow-sm">
                    <div className="card-body d-flex flex-column">
                      <div>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title fw-bold">{project.title}</h5>
                          <span className={`badge bg-${getDifficultyBadge(project.difficulty)}`}>{project.difficulty}</span>
                        </div>
                        
                        {/* ✨ NEW: Posted On and Duration details */}
                        <div className="d-flex justify-content-between text-muted small mb-3">
                            <span><i className="bi bi-calendar-check me-1"></i>Posted: {new Date(project.createdAt).toLocaleDateString()}</span>
                            <span><i className="bi bi-clock me-1"></i>Duration: {project.duration}</span>
                        </div>
                        
                        <p className="card-text text-muted mb-3">
                          {project.description.substring(0, 100)}...
                        </p>
                        
                        <div className="mb-3">
                          <h6 className="fw-bold mb-2">Required Skills:</h6>
                          <div className="d-flex flex-wrap gap-1">
                            {project.requiredSkills.map((skill, index) => (
                              <span key={index} className="badge bg-light text-dark p-2">{skill}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="d-flex justify-content-end align-items-center mt-auto">
                        {user && user.userType === 'junior' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setSelectedProject(project)}
                            data-bs-toggle="modal"
                            data-bs-target="#applicationModal"
                          >
                            Apply Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* --- Application Modal (No changes here) --- */}
      <div className="modal fade" id="applicationModal" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Apply for: {selectedProject?.title}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form onSubmit={handleApply}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Cover Letter *</label>
                  <textarea className="form-control" rows="4" value={applicationData.coverLetter} onChange={(e) => setApplicationData({...applicationData, coverLetter: e.target.value})} placeholder="Tell the senior developer why you're interested..." required></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">Resume (PDF only) *</label>
                  <input type="file" className="form-control" accept=".pdf" onChange={(e) => setResumeFile(e.target.files[0])} required/>
                </div>
                <div className="mb-3">
                  <label className="form-label">Portfolio URL</label>
                  <input type="url" className="form-control" value={applicationData.portfolioUrl} onChange={(e) => setApplicationData({...applicationData, portfolioUrl: e.target.value})} placeholder="https://your-portfolio.com"/>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseOpenings;