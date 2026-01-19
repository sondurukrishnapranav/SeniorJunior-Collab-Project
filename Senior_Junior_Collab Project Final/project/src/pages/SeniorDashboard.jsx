import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const SeniorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState([]); // All projects by the senior
  const [activeProjects, setActiveProjects] = useState([]); // Projects with status 'closed'
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [applications, setApplications] = useState([]); // All applications for the *selected* project
  const [newProject, setNewProject] = useState({ title: '', description: '', requiredSkills: '', duration: '', difficulty: 'Intermediate' });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);
  
  // ✅ UPDATED: Reset applications when selectedProject changes or becomes null
  useEffect(() => {
    if (selectedProject) {
        fetchApplications(selectedProject._id);
    } else {
        setApplications([]); // Clear applications if no project is selected
    }
  }, [selectedProject]);


  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [allProjectsRes, activeProjectsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/projects/my-projects'),
        axios.get('http://localhost:5000/api/projects/my-active-projects')
      ]);
      setProjects(allProjectsRes.data);
      setActiveProjects(activeProjectsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  };

  // ✅ UPDATED: This now explicitly fetches applications for a given projectId
  const fetchApplications = async (projectId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/applications/project/${projectId}`);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications for project:', projectId, error);
      setApplications([]); // Ensure applications are cleared on error
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = newProject.requiredSkills.split(',').map(s => s.trim());
      await axios.post('http://localhost:5000/api/projects', { ...newProject, requiredSkills: skillsArray });
      setShowCreateModal(false);
      setNewProject({ title: '', description: '', requiredSkills: '', duration: '', difficulty: 'Intermediate' });
      fetchAllData(); // Re-fetch all data to update project list
      alert('Project created successfully!');
    } catch (error) {
      alert('Error creating project');
    }
  };

  const handleApplicationAction = async (applicationId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/applications/${applicationId}`, { status });
      // ✅ UPDATED: Update the applications state for the selected project
      setApplications(prevApps => prevApps.map(app => 
        app._id === applicationId ? { ...app, status: status } : app
      ));
      alert(`Application status updated to "${status}"!`);
    } catch (error) {
      alert('Error updating application status');
    }
  };
  
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure? This will permanently delete the project and all applications.')) return;
    try {
        await axios.delete(`http://localhost:5000/api/projects/${projectId}`);
        setProjects(projects.filter(p => p._id !== projectId));
        // If the deleted project was the one currently selected, clear selection
        if (selectedProject && selectedProject._id === projectId) {
            setSelectedProject(null);
            setApplications([]);
        }
        alert('Project deleted successfully.');
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete project.');
    }
  };
  
  const handleUpdateProjectStatus = async (project, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/projects/${project._id}`, { status: newStatus });
      fetchAllData(); // Re-fetch all data to update UI everywhere
      // If the selected project's status was changed, update selected project state too
      if (selectedProject && selectedProject._id === project._id) {
          setSelectedProject(prev => ({ ...prev, status: newStatus }));
      }
      alert(`Project status updated to "${newStatus}"!`);
    } catch (error) {
      alert('Error updating project status.');
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const colors = { 'Beginner': 'success', 'Intermediate': 'warning', 'Advanced': 'danger' };
    return colors[difficulty] || 'secondary';
  };
  
  const getStatusBadge = (status) => {
    const colors = { 'pending': 'warning', 'reviewing': 'info', 'accepted': 'success', 'rejected': 'danger' };
    return colors[status] || 'secondary';
  };

  // Helper to count pending applications for the stats card
  const getTotalPendingApplications = () => {
    // This now counts all pending applications across all owned projects
    return projects.reduce((sum, project) => 
        sum + (project.applications ? project.applications.filter(app => app.status === 'pending').length : 0), 0);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{minHeight: '80vh'}}>
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Welcome back, {user?.name}!</h2>
          <p className="text-muted">Manage your projects and mentor junior developers</p>
        </div>
        <span className="badge bg-success fs-6">Senior Developer</span>
      </div>
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm h-100 text-center p-3">
            <i className="bi bi-briefcase display-4 text-primary mb-2"></i>
            <h4 className="fw-bold">{projects.length}</h4>
            <p className="text-muted mb-0">Total Projects</p>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm h-100 text-center p-3">
            <i className="bi bi-eye display-4 text-info mb-2"></i>
            <h4 className="fw-bold">{projects.filter(p => p.status === 'open').length}</h4>
            <p className="text-muted mb-0">Open Projects</p>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm h-100 text-center p-3">
            <i className="bi bi-people display-4 text-success mb-2"></i>
            {/* Using the applications state for the current selected project for the "New Apps" count is misleading
                unless we sum up all pending applications from all projects. For simplicity, let's keep it
                referring to the currently viewed project's pending applications if one is selected,
                or a general count if it's the overview. For now, we'll keep it simple for a specific context.
                A better approach would be to fetch overall application counts for the overview.
                For now, let's just count pending for the selected project, or 0 if none.
            */}
            <h4 className="fw-bold">{selectedProject ? applications.filter(app => app.status === 'pending').length : 0}</h4>
            <p className="text-muted mb-0">New Apps (Current Project)</p>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm h-100 text-center p-3">
            <i className="bi bi-star display-4 text-warning mb-2"></i>
            <h4 className="fw-bold">4.9</h4>
            <p className="text-muted mb-0">Rating</p>
          </div>
        </div>
      </div>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item"><button className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => { setActiveTab('overview'); setSelectedProject(null); }}>
            <i className="bi bi-house me-2"></i>Overview
        </button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => { setActiveTab('projects'); setSelectedProject(null); }}>
            <i className="bi bi-briefcase me-2"></i>My Projects
        </button></li>
        {/* Only show "New Applications" and "Review Candidates" if a project is selected */}
        {selectedProject && (
          <>
            <li className="nav-item"><button className={`nav-link ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>
                <i className="bi bi-people me-2"></i>New Applications ({applications.filter(app => app.status === 'pending').length})
            </button></li>
            <li className="nav-item"><button className={`nav-link ${activeTab === 'review' ? 'active' : ''}`} onClick={() => setActiveTab('review')}>
                <i className="bi bi-person-check me-2"></i>Review Candidates ({applications.filter(app => app.status === 'reviewing').length})
            </button></li>
          </>
        )}
      </ul>
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="row">
            <div className="col-md-6 mb-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Quick Actions</h5>
                  <div className="d-grid gap-2">
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}><i className="bi bi-plus-lg me-2"></i>Create New Project</button>
                    <a href="/profile" className="btn btn-outline-primary"><i className="bi bi-person me-2"></i>Update Profile</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Recent Projects</h5>
                  {projects.slice(0, 3).map((p) => (
                    <div key={p._id} className="d-flex justify-content-between align-items-center mb-2">
                      <span>{p.title}</span>
                      <span className={`badge bg-${p.status === 'open' ? 'success' : 'secondary'}`}>{p.status}</span>
                    </div>
                  ))}
                  {projects.length === 0 && <p className="text-muted">No projects yet</p>}
                </div>
              </div>
            </div>
            <div className="col-12 mt-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Active Projects</h5>
                  {activeProjects.length > 0 ? activeProjects.map((p) => (
                    <div key={p._id} className="p-2 bg-light rounded mb-2">
                      <strong>{p.title}</strong> <span className="text-muted">({p.acceptedJuniors.length} junior(s))</span>
                    </div>
                  )) : <p className="text-muted">No projects are currently active.</p>}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'projects' && (
          <div className="row">
            <div className="col-12 mb-3">
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}><i className="bi bi-plus-lg me-2"></i>Create New Project</button>
            </div>
            <div className="col-12">
              {projects.length === 0 ? (
                <div className="card shadow-sm text-center py-5">
                  <i className="bi bi-briefcase display-1 text-muted mb-3"></i>
                  <h4>No Projects Yet</h4>
                  <p className="text-muted mb-3">Create your first project to get started!</p>
                </div>
              ) : (
                <div className="row">
                  {projects.map((p) => (
                    <div key={p._id} className="col-md-6 col-lg-4 mb-4">
                      <div className="card h-100 shadow-sm">
                        <div className="card-body d-flex flex-column">
                          <div>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <h6 className="fw-bold">{p.title}</h6>
                              <span className={`badge bg-${getDifficultyBadge(p.difficulty)}`}>{p.difficulty}</span>
                            </div>
                            <p className="text-muted small">{p.description}</p>
                            <div className="d-flex flex-wrap gap-1">
                              {p.requiredSkills.map((s, i) => (<span key={i} className="badge bg-light text-dark">{s}</span>))}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-auto pt-3">
                            <span className={`badge bg-${p.status === 'open' ? 'success' : (p.status === 'closed' ? 'warning' : 'secondary')} text-capitalize`}>{p.status}</span>
                            <div className="btn-group">
                                <button 
                                    className="btn btn-sm btn-primary" 
                                    onClick={() => { setSelectedProject(p); setActiveTab('manage'); /* fetchApplications is called by useEffect */ }}>
                                    Manage
                                </button>
                                {p.status === 'open' && (
                                    <button className="btn btn-sm btn-outline-warning" onClick={() => handleUpdateProjectStatus(p, 'closed')}>Close</button>
                                )}
                                {p.status === 'closed' && (
                                    <button className="btn btn-sm btn-outline-success" onClick={() => handleUpdateProjectStatus(p, 'completed')}>Complete</button>
                                )}
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteProject(p._id)}>Delete</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'manage' && selectedProject && ( // Only render if activeTab is 'manage' AND a project is selected
            <div className="card shadow-sm">
                <div className="card-body">
                    <h5 className="fw-bold mb-4">New Applications for: {selectedProject.title}</h5>
                    {(() => {
                        const pendingApps = applications.filter(app => app.status === 'pending');
                        return pendingApps.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <i className="bi bi-inbox display-1 mb-3"></i>
                                <h4>No New Applications</h4>
                                <p>All current applications have been reviewed or moved to review.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>Applicant</th>
                                            <th>Applied On</th>
                                            <th>Resume</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingApps.map((app) => (
                                            <tr key={app._id}>
                                                <td>{app.juniorId?.name || 'N/A'}</td>
                                                <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                                                <td>
                                                    {app.resumePath ? (
                                                        <a href={`http://localhost:5000/${app.resumePath.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-info">View Resume</a>
                                                    ) : (
                                                        <span className="text-muted">Not Provided</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="btn-group">
                                                        <button className="btn btn-sm btn-primary" onClick={() => handleApplicationAction(app._id, 'reviewing')}>Move to Review</button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => handleApplicationAction(app._id, 'rejected')}>Reject</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })()}
                </div>
            </div>
        )}
        
        {activeTab === 'review' && selectedProject && ( // Only render if activeTab is 'review' AND a project is selected
            <div className="card shadow-sm">
                <div className="card-body">
                    <h5 className="fw-bold mb-4">Reviewing Candidates for: {selectedProject.title}</h5>
                    {(() => {
                        const reviewingApps = applications.filter(app => app.status === 'reviewing');
                        return reviewingApps.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <i className="bi bi-person-x display-1 mb-3"></i>
                                <h4>No Candidates in Review</h4>
                                <p>All candidates have either been accepted, rejected, or are pending initial review.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>Applicant</th>
                                            <th>Applied On</th>
                                            <th>Resume</th>
                                            <th>Final Decision</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reviewingApps.map((app) => (
                                            <tr key={app._id}>
                                                <td>{app.juniorId?.name || 'N/A'}</td>
                                                <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                                                <td>
                                                    {app.resumePath ? (
                                                        <a href={`http://localhost:5000/${app.resumePath.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-info">View Resume</a>
                                                    ) : (
                                                        <span className="text-muted">Not Provided</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="btn-group">
                                                        <button className="btn btn-sm btn-success" onClick={() => handleApplicationAction(app._id, 'accepted')}>Accept</button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => handleApplicationAction(app._id, 'rejected')}>Reject</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })()}
                </div>
            </div>
        )}
      </div>
      
      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Project</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateProject}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Project Title *</label>
                    <input type="text" className="form-control" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} required/>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description *</label>
                    <textarea className="form-control" rows="4" value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} required></textarea>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Required Skills *</label>
                      <input type="text" className="form-control" value={newProject.requiredSkills} onChange={(e) => setNewProject({...newProject, requiredSkills: e.target.value})} placeholder="React, Node.js, Python" required/>
                      <div className="form-text">Separate skills with commas</div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Duration *</label>
                      <input type="text" className="form-control" value={newProject.duration} onChange={(e) => setNewProject({...newProject, duration: e.target.value})} placeholder="e.g., 2-3 months" required/>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Difficulty Level *</label>
                    <select className="form-select" value={newProject.difficulty} onChange={(e) => setNewProject({...newProject, difficulty: e.target.value})}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Project</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeniorDashboard;