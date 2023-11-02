export interface Compressor {
  fileImage: Blob | MediaSource;
  type?: `image/${'jpg' | 'jpeg' | 'webp' | 'png'}`;
  percentage?: number;
}

export interface CompressorLoaded {
  blob: Blob | MediaSource | File;
  urlImage: string;
}
