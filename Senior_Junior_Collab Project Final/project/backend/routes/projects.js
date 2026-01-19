const express = require('express');
const Project = require('../models/Project');
// ✨ NEW: Import Application model and Node.js modules
const Application = require('../models/Application');
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ... (GET and POST routes remain the same)
// Get all open projects
router.get('/', async (req, res) => {
  try {
    const openProjects = await Project.find({ status: 'open' }).populate('seniorId', 'name');
    res.json(openProjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get projects by senior (for senior dashboard)
router.get('/my-projects', authenticateToken, async (req, res) => {
  if (req.user.userType !== 'senior') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const userProjects = await Project.find({ seniorId: req.user.userId });
    res.json(userProjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get junior's accepted projects
router.get('/junior-projects', authenticateToken, async (req, res) => {
  if (req.user.userType !== 'junior') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const juniorProjects = await Project.find({ acceptedJuniors: req.user.userId });
    res.json(juniorProjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new project (seniors only)
router.post('/', authenticateToken, async (req, res) => {
  if (req.user.userType !== 'senior') {
    return res.status(403).json({ message: 'Only seniors can create projects' });
  }
  try {
    const { title, description, requiredSkills, duration, difficulty } = req.body;
    const newProject = new Project({
      title,
      description,
      requiredSkills,
      duration,
      difficulty,
      seniorId: req.user.userId,
    });
    const project = await newProject.save();
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project - (No changes here)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updatedProject = await Project.findOneAndUpdate(
      { _id: req.params.id, seniorId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found or unauthorized' });
    }
    res.json({ message: 'Project updated successfully', project: updatedProject });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// ✅ ENHANCED: Delete project and all its associated applications/files
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    const seniorId = req.user.userId;
    const project = await Project.findOne({ _id: projectId, seniorId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found or unauthorized' });
    }
    // Find all applications for this project to delete their resumes
    const applicationsToDelete = await Application.find({ projectId: projectId });
    for (const app of applicationsToDelete) {
      if (app.resumePath) {
        const filePath = path.join(__dirname, '..', app.resumePath);
        fs.unlink(filePath, err => {
          if (err) console.error(`Failed to delete resume for application ${app._id}:`, err);
        });
      }
    }
    // Delete all applications associated with the project
    await Application.deleteMany({ projectId: projectId });
    // Finally, delete the project itself
    await Project.findByIdAndDelete(projectId);
    res.json({ message: 'Project and all associated applications deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/my-active-projects', authenticateToken, async (req, res) => {
  if (req.user.userType !== 'senior') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const activeProjects = await Project.find({ 
      seniorId: req.user.userId,
      status: 'closed' // An "active" project is one that is closed for applications but not yet completed
    }).populate('acceptedJuniors', 'name email');
    res.json(activeProjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;