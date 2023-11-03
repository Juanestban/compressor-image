export interface Compressor {
  fileImage: Blob | MediaSource;
  filename?: string;
  type?: `image/${'jpg' | 'jpeg' | 'webp' | 'png'}`;
  percentage?: number;
}

export interface CompressorLoaded {
  blob: Blob | MediaSource | File;
  urlImage: string;
  file: File;
}

export interface CompressorAllImages {
  images: Omit<Compressor, 'percentage'>[];
  percentage?: number;
}

export interface CompressedAllImages {
  result: CompressorLoaded[];
  blobsFailedReason: string[];
}
