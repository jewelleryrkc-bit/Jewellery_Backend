import { FileUpload } from "graphql-upload-ts";
import { v4 as uuid } from "uuid";
import { v2 as cloudinaryV2 } from "cloudinary";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// Initialize Cloudinary
cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadedFileResponse {
  key: string; // Cloudinary public_id or S3 key
  url: string; // public URL
}

export class UploadService {
  private provider = process.env.UPLOAD_PROVIDER || "cloudinary"; // "cloudinary" | "s3";

  private s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  constructor() {
    console.log("UploadService initialized with provider:", this.provider);
  }

  // ------------------------
  // REST: upload single IMAGE (Multer)
  // ------------------------
  static async uploadImage(
    file: Express.Multer.File
  ): Promise<{ url: string; key: string }> {
    return new Promise<{ url: string; key: string }>((resolve, reject) => {
      cloudinaryV2.uploader
        .upload_stream({ folder: "products" }, (error, result) => {
          if (error || !result) return reject(error);
          resolve({ url: result.secure_url, key: result.public_id });
        })
        .end(file.buffer);
    });
  }

  // ------------------------
  // REST: upload single VIDEO (Multer)
  // ------------------------
  static async uploadVideo(
    file: Express.Multer.File
  ): Promise<{ url: string; key: string }> {
    return new Promise<{ url: string; key: string }>((resolve, reject) => {
      cloudinaryV2.uploader
        .upload_stream(
          {
            folder: "product-videos",
            resource_type: "video", // important for Cloudinary
          },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve({ url: result.secure_url, key: result.public_id });
          }
        )
        .end(file.buffer);
    });
  }

  // ------------------------
  // GraphQL: upload ONE file (image or video)
  // ------------------------
  async upload(
    file: Promise<FileUpload>,
    folder: string,
    resourceType: "image" | "video" = "image"
  ): Promise<UploadedFileResponse> {
    return this.provider === "s3"
      ? this.uploadS3(file, folder)
      : this.uploadCloudinary(file, folder, resourceType);
  }

  // ------------------------
  // GraphQL: upload MANY files
  // ------------------------
  async uploadMany(
    files: Promise<FileUpload>[],
    folder: string,
    resourceType: "image" | "video" = "image"
  ): Promise<UploadedFileResponse[]> {
    return Promise.all(
      files.map((file) => this.upload(file, folder, resourceType))
    );
  }

  // ------------------------
  // CLOUDINARY UPLOAD (image / video)
  // ------------------------
  private async uploadCloudinary(
    file: Promise<FileUpload>,
    folder: string,
    resourceType: "image" | "video"
  ): Promise<UploadedFileResponse> {
    const { createReadStream } = await file;
    const stream = createReadStream();

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinaryV2.uploader.upload_stream(
        { folder, resource_type: resourceType },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve({ url: result.secure_url, key: result.public_id });
        }
      );

      stream.pipe(uploadStream);
    });
  }

  // ------------------------
  // S3 UPLOAD (any type)
  // ------------------------
  private async uploadS3(
    file: Promise<FileUpload>,
    folder: string
  ): Promise<UploadedFileResponse> {
    const { createReadStream, filename, mimetype } = await file;
    const stream = createReadStream();
    const key = `${folder}/${uuid()}-${filename}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: stream,
        ContentType: mimetype,
      })
    );

    return {
      key,
      url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
  }

  // ------------------------
  // DELETE FILE (image or video)
  // ------------------------
  async delete(key: string) {
    return this.provider === "s3"
      ? this.deleteS3(key)
      : this.deleteCloudinary(key);
  }

  private async deleteCloudinary(key: string) {
    await cloudinaryV2.uploader.destroy(key, { resource_type: "auto" });
    return true;
  }

  private async deleteS3(key: string) {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
      })
    );
    return true;
  }

  // ------------------------
  // REPLACE FILE (delete + upload)
  // ------------------------
  async replace(
    oldKey: string,
    file: Promise<FileUpload>,
    folder: string,
    resourceType: "image" | "video" = "image"
  ): Promise<UploadedFileResponse> {
    await this.delete(oldKey);
    return this.upload(file, folder, resourceType);
  }
}
