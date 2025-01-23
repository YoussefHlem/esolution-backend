const mongoose = require('mongoose');
const multer = require('multer');

const conn = mongoose.connection;

// Initialize GridFS bucket
let bucket;
conn.once('open', () => {
	bucket = new mongoose.mongo.GridFSBucket(conn.db, {
		bucketName: 'uploads'
	});
});

// Configure storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// File upload middleware
const uploadMiddleware = (fieldName) => async (req, res, next) => {
	upload.single(fieldName)(req, res, async (err) => {
		if (err) return res.status(400).json({ message: err.message });
		if (!req.file) return next();

		const filename = `${Date.now()}-${req.file.originalname}`;
		const uploadStream = bucket.openUploadStream(filename, {
			contentType: req.file.mimetype
		});

		uploadStream.end(req.file.buffer);

		req.fileId = uploadStream.id;
		req.filename = filename;
		next();
	});
};

// Get file by filename
const getFileByName = async (filename) => {
	return new Promise((resolve, reject) => {
		const downloadStream = bucket.openDownloadStreamByName(filename);
		const chunks = [];
		downloadStream.on('data', chunk => chunks.push(chunk));
		downloadStream.on('error', reject);
		downloadStream.on('end', () => resolve(Buffer.concat(chunks)));
	});
};

module.exports = { uploadMiddleware, getFileByName };