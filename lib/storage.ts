// lib/storage.ts — Image storage abstraction
// Never stores Base64 in DB. Returns a URL string for storage in imageUrl fields.
// Swap providers via environment variable: IMAGE_STORAGE_PROVIDER=local|s3|cloudinary

import fs from "fs/promises";
import path from "path";

export interface StorageProvider {
  upload(
    buffer: Buffer,
    filename: string,
    folder: string,
    mimeType: string
  ): Promise<string>;
  delete(url: string): Promise<void>;
}

// ─────────────────────────────────────────────
// Local Filesystem Provider (development)
// ─────────────────────────────────────────────

class LocalStorageProvider implements StorageProvider {
  private baseDir: string;
  private baseUrl: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), "public", "uploads");
    this.baseUrl = "/uploads";
  }

  async upload(
    buffer: Buffer,
    filename: string,
    folder: string,
    _mimeType: string
  ): Promise<string> {
    const dir = path.join(this.baseDir, folder);
    await fs.mkdir(dir, { recursive: true });
    const filePath = path.join(dir, filename);
    await fs.writeFile(filePath, buffer);
    return `${this.baseUrl}/${folder}/${filename}`;
  }

  async delete(url: string): Promise<void> {
    const filePath = path.join(
      process.cwd(),
      "public",
      url.replace(/^\//, "")
    );
    try {
      await fs.unlink(filePath);
    } catch {
      // File may not exist, ignore
    }
  }
}

// ─────────────────────────────────────────────
// S3 Provider (production — stub, configure via env)
// ─────────────────────────────────────────────

class S3StorageProvider implements StorageProvider {
  async upload(
    _buffer: Buffer,
    _filename: string,
    _folder: string,
    _mimeType: string
  ): Promise<string> {
    // TODO: implement with @aws-sdk/client-s3
    // Requires: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET
    throw new Error(
      "S3 storage provider not configured. Set IMAGE_STORAGE_PROVIDER=local or configure S3 env vars."
    );
  }

  async delete(_url: string): Promise<void> {
    throw new Error("S3 storage provider not configured.");
  }
}

// ─────────────────────────────────────────────
// Factory — selects provider based on env
// ─────────────────────────────────────────────

function getStorageProvider(): StorageProvider {
  const provider = process.env.IMAGE_STORAGE_PROVIDER || "local";
  switch (provider) {
    case "s3":
      return new S3StorageProvider();
    case "local":
    default:
      return new LocalStorageProvider();
  }
}

export const storage = getStorageProvider();

// ─────────────────────────────────────────────
// Helper: parse multipart file buffer
// ─────────────────────────────────────────────

/**
 * Generate a unique filename for an uploaded image
 */
export function generateFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}${ext}`;
}

/**
 * Validate that the uploaded file is an image
 */
export function isValidImageMimeType(mimeType: string): boolean {
  return ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"].includes(
    mimeType.toLowerCase()
  );
}

/**
 * Max upload size in bytes (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
