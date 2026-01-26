import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api'; // ✅ Import api

const JuniorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [applications, setApplications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [viewingApplication, setViewingApplication] = useState(null);

  // ✅ SERVER_URL Logic: Detects if using localhost or production URL
  const SERVER_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : 'http://localhost:5000';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // ✅ Use api instance
      const [applicationsRes, projectsRes] = await Promise.all([
        api.get('/applications/my-applications'),
        api.get('/projects/junior-projects')
      ]);
      setApplications(applicationsRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  };
  
  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
        // ✅ Use api instance
        await api.delete(`/applications/${applicationId}`);
        setApplications(applications.filter(app => app._id !== applicationId));
        alert('Application withdrawn successfully.');
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to withdraw application.');
    }
  };

  const getStatusBadge = (status) => {
    const colors = { 'pending': 'warning', 'reviewing': 'info', 'accepted': 'success', 'rejected': 'danger' };
    return colors[status] || 'secondary';
  };
  
  const getTimelineStepClass = (stepStatus) => {
    const currentStatus = viewingApplication?.status;
    const statusOrder = ['pending', 'reviewing', 'accepted', 'rejected'];
    const currentStepIndex = statusOrder.indexOf(currentStatus);
    const thisStepIndex = statusOrder.indexOf(stepStatus);
    if (currentStatus === 'rejected' && stepStatus !== 'pending') return 'text-muted';
    if (thisStepIndex < currentStepIndex) return 'text-success';
    if (thisStepIndex === currentStepIndex) return 'text-primary fw-bold';
    return 'text-muted';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4"><div><h2 className="fw-bold">Welcome back, {user?.name}!</h2><p className="text-muted">Here's what's happening with your projects</p></div><div className="text-end"><span className="badge bg-primary fs-6">Junior Developer</span></div></div>
      <div className="row mb-4">
        <div className="col-md-3 mb-3"><div className="card shadow-sm h-100 text-center p-3"><i className="bi bi-file-earmark-text display-4 text-primary mb-2"></i><h4 className="fw-bold">{applications.length}</h4><p className="text-muted mb-0">Applications</p></div></div>
        <div className="col-md-3 mb-3"><div className="card shadow-sm h-100 text-center p-3"><i className="bi bi-check-circle display-4 text-success mb-2"></i><h4 className="fw-bold">{applications.filter(a => a.status === 'accepted').length}</h4><p className="text-muted mb-0">Accepted</p></div></div>
        <div className="col-md-3 mb-3"><div className="card shadow-sm h-100 text-center p-3"><i className="bi bi-briefcase display-4 text-info mb-2"></i><h4 className="fw-bold">{projects.length}</h4><p className="text-muted mb-0">Active Projects</p></div></div>
        <div className="col-md-3 mb-3"><div className="card shadow-sm h-100 text-center p-3"><i className="bi bi-star display-4 text-warning mb-2"></i><h4 className="fw-bold">4.8</h4><p className="text-muted mb-0">Rating</p></div></div>
      </div>
      <ul className="nav nav-tabs mb-4">
          <li className="nav-item"><button className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><i className="bi bi-house me-2"></i>Overview</button></li>
          <li className="nav-item"><button className={`nav-link ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}><i className="bi bi-file-earmark-text me-2"></i>My Applications</button></li>
          <li className="nav-item"><button className={`nav-link ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}><i className="bi bi-briefcase-fill me-2"></i>Active Projects</button></li>
      </ul>
      <div className="tab-content">
          {activeTab === 'overview' && (
              <div className="row">
                  <div className="col-md-6 mb-3"><div className="card shadow-sm"><div className="card-body"><h5 className="fw-bold mb-3">Recent Applications</h5>{applications.length > 0 ? (applications.slice(0, 3).map((app) => (<div key={app._id} className="d-flex justify-content-between align-items-center mb-2"><span>{app.projectId?.title || 'Deleted Project'}</span><span className={`badge bg-${getStatusBadge(app.status)} text-capitalize`}>{app.status}</span></div>))) : (<p className="text-muted">No applications yet</p>)}</div></div></div>
                  <div className="col-md-6 mb-3"><div className="card shadow-sm"><div className="card-body"><h5 className="fw-bold mb-3">Quick Actions</h5><div className="d-grid gap-2"><a href="/browse-openings" className="btn btn-primary"><i className="bi bi-search me-2"></i>Browse New Projects</a><a href="/profile" className="btn btn-outline-primary"><i className="bi bi-person me-2"></i>Update Profile</a></div></div></div></div>
              </div>
          )}
          {activeTab === 'applications' && (
            <div className="card shadow-sm"><div className="card-body">
              <h5 className="fw-bold mb-4">My Applications</h5>
              {applications.length === 0 ? (<div className="text-center py-5"><i className="bi bi-inbox display-1 text-muted mb-3"></i><h4>No Applications Yet</h4><p className="text-muted mb-3">Start applying to projects to see them here</p><a href="/browse-openings" className="btn btn-primary">Browse Projects</a></div>
              ) : (
                <div className="table-responsive"><table className="table table-hover align-middle"><thead><tr><th>Project Title</th><th>Applied Date</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>{applications.map((app) => {
                      const isWithin24Hours = new Date() - new Date(app.appliedAt) < 24 * 60 * 60 * 1000;
                      const canWithdraw = app.status === 'pending' && isWithin24Hours;
                      return (
                        <tr key={app._id}>
                          <td>{app.projectId?.title || 'N/A'}</td>
                          <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                          <td><span className={`badge bg-${getStatusBadge(app.status)} text-capitalize`}>{app.status}</span></td>
                          <td><div className="btn-group">
                              <button className="btn btn-sm btn-outline-primary" onClick={() => setViewingApplication(app)}>View Details</button>
                              {canWithdraw && (<button className="btn btn-sm btn-outline-danger" onClick={() => handleWithdraw(app._id)}>Withdraw</button>)}
                          </div></td>
                        </tr>
                      );
                  })}</tbody>
                </table></div>
              )}
            </div></div>
          )}
          {activeTab === 'projects' && (
            <div className="card shadow-sm"><div className="card-body">
              <h5 className="fw-bold mb-4">My Active Projects</h5>
              {projects.length === 0 ? (<div className="text-center py-5"><i className="bi bi-briefcase display-1 text-muted mb-3"></i><h4>No Active Projects</h4><p className="text-muted mb-3">Once you're accepted to a project, it will appear here.</p><a href="/browse-openings" className="btn btn-primary">Find Projects</a></div>
              ) : (
                <div className="row">{projects.map((project) => (
                    <div key={project._id} className="col-md-6 mb-3"><div className="card">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center"><h6 className="fw-bold">{project.title}</h6><span className={`badge bg-${project.status === 'closed' ? 'success' : 'secondary'}`}>{project.status === 'closed' ? 'Active' : 'Completed'}</span></div>
                          <p className="text-muted small">{project.description}</p>
                          <button className="btn btn-sm btn-primary">View Project Details</button>
                        </div>
                    </div></div>
                ))}</div>
              )}
            </div></div>
          )}
      </div>
      {viewingApplication && (<div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className="modal-header"><h5 className="modal-title">Application Status: {viewingApplication.projectId?.title}</h5><button type="button" className="btn-close" onClick={() => setViewingApplication(null)}></button></div>
          <div className="modal-body"><ul className="list-unstyled ps-2">
              <li className={`mb-3 pb-3 border-start position-relative ${getTimelineStepClass('pending')}`}><i className="bi bi-check-circle-fill position-absolute" style={{top: '0', left: '-0.5rem'}}></i><strong className="ms-3">Application Sent</strong><p className="small text-muted ms-3">Your application was sent on {new Date(viewingApplication.appliedAt).toLocaleDateString()}.</p></li>
              <li className={`mb-3 pb-3 border-start position-relative ${getTimelineStepClass('reviewing')}`}><i className={`bi ${viewingApplication.status !== 'pending' ? 'bi-check-circle-fill' : 'bi-circle'} position-absolute`} style={{top: '0', left: '-0.5rem'}}></i><strong className="ms-3">In Review</strong><p className="small text-muted ms-3">The senior developer is reviewing your application.</p></li>
              <li className={`position-relative ${getTimelineStepClass(viewingApplication.status === 'rejected' ? 'rejected' : 'accepted')}`}>
                 {viewingApplication.status === 'accepted' && <><i className="bi bi-check-circle-fill position-absolute" style={{top: '0', left: '-0.5rem'}}></i><strong className="ms-3">Accepted!</strong><p className="small text-muted ms-3">Congratulations! You have been selected for this project.</p></>}
                 {viewingApplication.status === 'rejected' && <><i className="bi bi-x-circle-fill text-danger position-absolute" style={{top: '0', left: '-0.5rem'}}></i><strong className="ms-3 text-danger">Rejected</strong><p className="small text-muted ms-3">Your application was not selected at this time.</p></>}
                 {(viewingApplication.status !== 'accepted' && viewingApplication.status !== 'rejected') && <><i className="bi bi-circle position-absolute" style={{top: '0', left: '-0.5rem'}}></i><strong className="ms-3">Decision</strong><p className="small text-muted ms-3">A final decision will be made after the review period.</p></>}
              </li>
          </ul></div>
      </div></div></div>)}
    </div>
  );
};

export default JuniorDashboard;