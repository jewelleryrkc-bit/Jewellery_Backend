import { Resolver, Mutation, Arg, Ctx } from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "../types";
import fs from "fs";
import path from "path";

// Storage adapter interface (for future S3 switch)
interface StorageAdapter {
  saveFile(filename: string, buffer: Buffer, contentType: string): Promise<string>;
}

// Local storage implementation
class LocalStorage implements StorageAdapter {
  async saveFile(filename: string, buffer: Buffer, _p0: string) {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${filename}`; // URL for frontend
  }
}

const storage = new LocalStorage();

@Resolver(Post)
export class PostResolver {

  @Mutation(() => Post)
  async createPostWithBase64(
    @Arg("title") title: string,
    @Arg("fileBase64") fileBase64: string,
    @Ctx() { em }: MyContext
  ): Promise<Post> {
    // Strip data:image/jpeg;base64, prefix if present
    const base64Data = fileBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const filename = `${Date.now()}.jpg`;

    // Save file locally
    const imageUrl = await storage.saveFile(filename, buffer, "image/jpeg");

    // Save metadata in DB
    const post = em.create(Post, { title, imageUrl });
    await em.persistAndFlush(post);

    return post;
  }
}
