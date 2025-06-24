import { Buffer } from 'node:buffer';
import { promisify } from 'node:util';

import { imageHash } from 'image-hash';
import sharp from 'sharp';

const getImageHash = promisify(imageHash);

export class PerceptualHashService {
  private hashCache: Map<string, string>;

  constructor() {
    this.hashCache = new Map();
  }

  async generateHash(imageData: Buffer | string): Promise<string> {
    const data = typeof imageData === 'string' ? Buffer.from(imageData, 'base64') : imageData;

    // Use image-hash library for better perceptual hashing
    const hash = (await getImageHash(
      {
        data,
        ext: 'png',
      },
      16,
      true
    )) as string;

    return hash;
  }

  async compareHashes(hash1: string, hash2: string): Promise<number> {
    if (hash1.length !== hash2.length) {
      throw new Error('Hash lengths must be equal');
    }

    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] !== hash2[i]) {
        distance++;
      }
    }

    // Calculate similarity as percentage
    const similarity = 1 - distance / (hash1.length * 4); // 4 bits per hex char
    return similarity;
  }

  async isDuplicate(hash1: string, hash2: string, threshold: number = 0.95): Promise<boolean> {
    const similarity = await this.compareHashes(hash1, hash2);
    return similarity >= threshold;
  }

  private async simplifyImage(imageData: Buffer): Promise<Buffer> {
    // Resize image to 32x32 for DCT calculation
    const resized = await sharp(imageData)
      .resize(32, 32, { fit: 'fill' })
      .greyscale()
      .raw()
      .toBuffer();

    return resized;
  }

  private discreteCosineTransform(matrix: number[][]): number[][] {
    const size = matrix.length;
    const dct: number[][] = [];

    for (let v = 0; v < 8; v++) {
      dct[v] = [];
      for (let u = 0; u < 8; u++) {
        let sum = 0;
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            sum +=
              matrix[y][x] *
              Math.cos(((2 * x + 1) * u * Math.PI) / (2 * size)) *
              Math.cos(((2 * y + 1) * v * Math.PI) / (2 * size));
          }
        }

        const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
        const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
        dct[v][u] = (2 / size) * cu * cv * sum;
      }
    }

    return dct;
  }

  private calculateHash(dct: number[][]): string {
    const values: number[] = [];

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (x !== 0 || y !== 0) {
          values.push(dct[y][x]);
        }
      }
    }

    const median = this.calculateMedian(values);

    let hash = '';
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (x !== 0 || y !== 0) {
          hash += dct[y][x] > median ? '1' : '0';
        }
      }
    }

    const hexHash = Number.parseInt(hash, 2).toString(16).padStart(16, '0');
    return hexHash;
  }

  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }

    return sorted[mid];
  }

  clearCache(): void {
    this.hashCache.clear();
  }
}
