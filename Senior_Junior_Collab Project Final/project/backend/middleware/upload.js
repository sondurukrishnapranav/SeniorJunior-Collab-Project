const multer = require('multer');
const fs = require('fs');
const path = require('path');

// ✅ 1. Define Absolute Paths (Safer for Render/Railway)
const uploadDir = path.join(__dirname, '../uploads');
const resumesDir = path.join(uploadDir, 'resumes');
const avatarsDir = path.join(uploadDir, 'avatars');

// ✅ 2. Function to ensure directory exists
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = uploadDir; // Default fallback

    if (file.fieldname === 'resume') {
      dir = resumesDir;
    } else if (file.fieldname === 'profilePicture') {
      dir = avatarsDir;
    }
    
    // Create the folder immediately before saving
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // ✅ 3. Sanitize filename: remove spaces to avoid URL issues
    const cleanName = file.originalname.replace(/\s+/g, '-');
    cb(null, Date.now() + '-' + cleanName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'resume') {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Resume must be a PDF file!'), false);
    }
  } else if (file.fieldname === 'profilePicture') {
    // Accept standard image formats
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error('Profile picture must be a JPG or PNG!'), false);
    }
  } else {
    cb(new Error('Invalid file type!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  // ✅ 4. Increased limit for mobile uploads (15MB)
  limits: { fileSize: 1024 * 1024 * 15 } 
});

module.exports = upload;