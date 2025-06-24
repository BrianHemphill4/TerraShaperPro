export type StorageServiceInterface = {
  uploadFile: (bucket: string, file: File) => Promise<UploadResult>;
  downloadFile: (bucket: string, path: string) => Promise<Buffer>;
  deleteFile: (bucket: string, path: string) => Promise<void>;
  listFiles: (bucket: string, prefix?: string) => Promise<StorageFile[]>;
  getFileUrl: (bucket: string, path: string) => string;
}

export type UploadResult = {
  path: string;
  url: string;
  size: number;
  contentType: string;
}

export type StorageFile = {
  path: string;
  size: number;
  contentType: string;
  lastModified: Date;
}

// Implementation will be added when extracting from routers