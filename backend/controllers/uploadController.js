const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

require("dotenv").config();

// Cloudinary config (if not already globally set)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadVesselImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "vessels",

            // 🔥 THIS is your compression
            transformation: [
              {
                width: 1200,
                crop: "limit",
              },
              {
                quality: "auto:good",
                fetch_format: "auto",
              },
            ],
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );

        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req.file.buffer);

    res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Image upload failed",
      error: error.message,
    });
  }
};

module.exports = { uploadVesselImage };