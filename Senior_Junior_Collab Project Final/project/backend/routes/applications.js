const express = require('express');
const Application = require('../models/Application');
const Project = require('../models/Project');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();


router.post('/', authenticateToken, upload.single('resume'), async (req, res) => {
  if (req.user.userType !== 'junior') {
    return res.status(403).json({ message: 'Only juniors can apply' });
  }
  try {
    const { projectId, coverLetter, portfolioUrl } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Resume PDF is required.' });
    }

    const existingApplication = await Application.findOne({
      projectId,
      juniorId: req.user.userId,
    });
    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied to this project' });
    }
    
    const newApplication = new Application({
      projectId,
      juniorId: req.user.userId,
      coverLetter,
      resumePath: req.file.path,
      portfolioUrl,
    });
    const application = await newApplication.save();
    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    if (error instanceof multer.MulterError) {
        return res.status(400).json({ message: `File upload error: ${error.message}` });
    }
    console.error("Application submission error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/my-applications', authenticateToken, async (req, res) => {
  if (req.user.userType !== 'junior') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const juniorApplications = await Application.find({ juniorId: req.user.userId }).populate('projectId', 'title');
    res.json(juniorApplications);
  } catch (error) {
    console.error("Error fetching junior's applications:", error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/project/:projectId', authenticateToken, async (req, res) => {
  if (req.user.userType !== 'senior') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project || project.seniorId.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Unauthorized or project not found' });
    }
    const projectApplications = await Application.find({ projectId: req.params.projectId }).populate('juniorId', 'name email skills');
    res.json(projectApplications);
  } catch (error) {
    console.error("Error fetching project applications:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  if (req.user.userType !== 'senior') {
    return res.status(403).json({ message: 'Only seniors can manage applications' });
  }
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const project = await Project.findById(application.projectId);
    if (project.seniorId.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    application.status = status;
    await application.save();

    if (status === 'accepted') {
      await Project.findByIdAndUpdate(application.projectId, {
        $addToSet: { acceptedJuniors: application.juniorId }, // Use $addToSet to prevent duplicates
      });
    }

    res.json({ message: 'Application status updated', application });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.delete('/:id', authenticateToken, async (req, res) => {
  if (req.user.userType !== 'junior') {
    return res.status(403).json({ message: 'Only juniors can withdraw applications.' });
  }
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }
    
    if (application.juniorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You are not authorized to withdraw this application.' });
    }
    
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const timeDifference = new Date() - new Date(application.appliedAt);
    if (timeDifference > twentyFourHours) {
      return res.status(403).json({ message: 'Cannot withdraw an application after 24 hours.' });
    }

    
    if (application.resumePath) {
      const filePath = path.join(__dirname, '..', application.resumePath);
      fs.unlink(filePath, (err) => {
        if (err) console.error(`Failed to delete resume file: ${filePath}`, err);
      });
    }

    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application withdrawn successfully.' });

  } catch (error) {
    console.error("Error withdrawing application:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;