import { MAX_PERCENTAGE } from '@/constants';
import { type CompressorLoaded, type Compressor } from '@/models';

export const compressor = async ({
  fileImage,
  type = 'image/jpeg',
  percentage = 80,
}: Compressor): Promise<CompressorLoaded> => {
  try {
    const blob: Blob | MediaSource = await new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const image = new Image();

      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.getContext('2d')?.drawImage(image, 0, 0);
        canvas.toBlob(
          (blob) => {
            return !blob ? reject(blob) : resolve(blob);
          },
          type,
          percentage / MAX_PERCENTAGE,
        );
      };

      image.src = URL.createObjectURL(fileImage);
    });
    const urlImage = URL.createObjectURL(blob);

    return { blob, urlImage };
  } catch (track) {
    throw new Error(`Error to upload image, ${JSON.stringify(track)}`);
  }
};
