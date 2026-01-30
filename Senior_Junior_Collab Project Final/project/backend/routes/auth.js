const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const { authenticateToken } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const router = express.Router();
// Ensure this path points to the new robust upload.js we created
const upload = require('../middleware/upload'); 
const fs = require('fs');
const path = require('path');

// ✅ FIXED: Robust Email Transporter for Render (Port 465 SSL)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // Helps prevent some cloud SSL errors
  }
});

router.post(
  '/register',
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'profilePicture', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, email, password, userType, skills, experience, projectsCompleted, githubUrl } = req.body;

      if (userType === 'senior' && parseInt(projectsCompleted, 10) < 6) {
        return res.status(400).json({ message: 'Seniors must have completed at least 6 projects.' });
      }

      let user = await User.findOne({ email });
      if (user && user.isVerified) {
        return res.status(400).json({ message: 'User with this email already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const userData = {
        name,
        email,
        password: hashedPassword,
        userType,
        skills: skills ? skills.split(',').map(s => s.trim()) : [],
        experience,
        projectsCompleted,
        githubUrl,
        // Optional chaining handles if files are not uploaded
        resumePath: req.files?.resume?.[0]?.path,
        profilePicturePath: req.files?.profilePicture?.[0]?.path,
      };

      if (user && !user.isVerified) {
        await User.updateOne({ _id: user._id }, userData);
      } else {
        user = new User(userData);
        await user.save();
      }
      
      const otp = crypto.randomInt(100000, 999999).toString();
      user.verificationOTP = otp;
      user.verificationExpires = Date.now() + 300000;
      await user.save();
      
      // ✅ FIXED: Use the new robust transporter
      await transporter.sendMail({
        from: `"Senior-Junior Collab" <${process.env.EMAIL_USER}>`, 
        to: user.email, 
        subject: 'Verify Your Email Address',
        text: `Your verification code is: ${otp}. It will expire in 5 minutes.`
      });

      res.status(201).json({ message: 'Registration successful! Please check your email for a verification code.' });
    } catch (error) {
      console.error("Registration Error:", error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

// ✅ ADDED: Missing Resend OTP Route
router.post('/resend-otp', async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      if (user.isVerified) {
        return res.status(400).json({ message: 'Email is already verified.' });
      }
  
      const otp = crypto.randomInt(100000, 999999).toString();
      user.verificationOTP = otp;
      user.verificationExpires = Date.now() + 300000;
      await user.save();
  
      await transporter.sendMail({
        from: `"Senior-Junior Collab" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'New Verification Code',
        text: `Your new verification code is: ${otp}. It will expire in 5 minutes.`
      });
  
      res.status(200).json({ message: 'New OTP sent successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
});

router.put(
  '/profile',
  authenticateToken,
  upload.single('profilePicture'),
  async (req, res) => {
    try {
      const { name, skills, experience, projectsCompleted, githubUrl } = req.body;
      const user = await User.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      user.name = name || user.name;
      user.skills = skills ? skills.split(',').map(s => s.trim()) : user.skills;
      user.experience = experience || user.experience;
      user.projectsCompleted = projectsCompleted || user.projectsCompleted;
      user.githubUrl = githubUrl || user.githubUrl;

      if (req.file) {
        if (user.profilePicturePath) {
          // Use path.resolve to ensure we find the right file to delete
          // Note: On Render's ephemeral storage, deletion errors aren't critical
          const oldPath = path.resolve(user.profilePicturePath);
          if(fs.existsSync(oldPath)) {
             fs.unlink(oldPath, err => {
                if (err) console.error("Error deleting old avatar:", err);
             });
          }
        }
        user.profilePicturePath = req.file.path;
      }

      const updatedUser = await user.save();
      
      const userResponse = updatedUser.toObject();
      delete userResponse.password;
      
      res.json({ message: 'Profile updated successfully!', user: userResponse });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error during profile update.' });
    }
  }
);

router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({
      email,
      verificationOTP: otp,
      verificationExpires: { $gt: Date.now() }, 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please try registering again.' });
    }

    user.isVerified = true;
    user.verificationOTP = undefined;
    user.verificationExpires = undefined;
    await user.save();
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Email verified successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Your account is not verified. Please check your email.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, userType: user.userType },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: 'If a user with that email exists, a reset code has been sent.' });
    }
    const otp = crypto.randomInt(100000, 999999).toString();
    user.passwordResetOTP = otp;
    user.passwordResetExpires = Date.now() + 300000; 
    await user.save();

    // ✅ FIXED: Use the new robust transporter
    await transporter.sendMail({
      from: `"Senior-Junior Collab" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Your Password Reset Code',
      text: `Your password reset code is: ${otp}. It will expire in 5 minutes.`,
      html: `<b>Your password reset code is: ${otp}</b><p>It will expire in 5 minutes.</p>`,
    });

    res.status(200).json({ message: 'If a user with that email exists, a reset code has been sent.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const user = await User.findOne({
      email,
      passwordResetOTP: otp,
      passwordResetExpires: { $gt: Date.now() }, 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
 
    user.passwordResetOTP = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
    
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;