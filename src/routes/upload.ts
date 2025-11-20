import express from "express";
import multer from "multer";
import { UploadService } from "../services/uploadService";

const router = express.Router();

// Use memory storage so we can stream files to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

router.post("/images", upload.array("images"), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadedImages = [];

    for (const file of files) {
      console.log("Uploading file:", file.originalname, file.size, "bytes");
      const result = await UploadService.uploadImage(file); // returns { url, key }
      uploadedImages.push(result);
    }

    // Return structured response for frontend
    return res.json({ images: uploadedImages });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
