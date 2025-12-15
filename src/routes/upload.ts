import express from "express";
import multer from "multer";
import { UploadService } from "../services/uploadService";

const router = express.Router();

// Use memory storage so we can stream files to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

router.post("/images", upload.array("images"), async (req, res) => {
  try {

    console.log("FILES RECEIVED FROM FRONTEND:", req.files);
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      console.log("❌ No files received");
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadedImages = [];

    for (const file of files) {
      console.log("Uploading file:", file.originalname, file.size, "bytes");
      const result = await UploadService.uploadImage(file); // returns { url, key }
      uploadedImages.push(result);
    }
    console.log(" FINAL RESPONSE:", uploadedImages);
    // Return structured response for frontend
    return res.json({ images: uploadedImages });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
});

router.post("/video", upload.single("video"), async (req, res) => {
  try {
    const file = req.file as Express.Multer.File | undefined;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // optional: size/type checks here before upload

    const result = await UploadService.uploadVideo(file); // { url, key }
    return res.json({ video: result });
  } catch (err) {
    console.error("VIDEO UPLOAD ERROR:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
