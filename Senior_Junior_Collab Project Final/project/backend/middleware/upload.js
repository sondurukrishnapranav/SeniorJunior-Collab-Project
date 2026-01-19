const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = './uploads/';

    if (file.fieldname === 'resume') {
      dir += 'resumes/';
    } else if (file.fieldname === 'profilePicture') {
      dir += 'avatars/';
    }
    
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
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
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
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
  limits: { fileSize: 1024 * 1024 * 5 } 
});

module.exports = upload;