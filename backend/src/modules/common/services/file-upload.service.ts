import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class FileUploadService {
  private readonly uploadDir = 'uploads';

  constructor() {
    this.ensureUploadDirectoryExists();
  }

  private async ensureUploadDirectoryExists() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const hash = crypto.createHash('md5').update(`${originalName}${timestamp}`).digest('hex');
    const ext = path.extname(originalName);
    return `${hash}${ext}`;
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    const fileName = this.generateFileName(file.originalname);
    const filePath = path.join(this.uploadDir, fileName);
    
    await fs.writeFile(filePath, file.buffer);
    
    return fileName;
  }

  async getFilePath(fileName: string): Promise<string> {
    return path.join(this.uploadDir, fileName);
  }

  async deleteFile(fileName: string): Promise<void> {
    const filePath = await this.getFilePath(fileName);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Error deleting file ${fileName}:`, error);
    }
  }
}
