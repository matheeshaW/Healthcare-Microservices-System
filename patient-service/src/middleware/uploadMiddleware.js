const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'medical_reports',
        resource_type: 'auto', //supports all file types (images, PDFs, etc.)
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'] // restrict to specific formats
    }
});

const upload = multer({ storage });

module.exports = upload;