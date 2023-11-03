import { MAX_PERCENTAGE } from '@/constants';
import {
  type CompressorLoaded,
  type Compressor,
  type CompressedAllImages,
  type CompressorAllImages,
} from '@/models';
import { getFile } from '@/utils/getFile';

export const compressor = async ({
  fileImage,
  filename = '',
  type = 'image/jpeg',
  percentage = 80,
}: Compressor): Promise<CompressorLoaded> => {
  try {
    const blob: Blob = await new Promise((resolve, reject) => {
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

    const file = getFile({ blob, filename });

    return { blob, urlImage, file };
  } catch (track) {
    throw new Error(`Error to upload image, ${JSON.stringify(track)}`);
  }
};

export const compressorAll = async ({
  images,
  percentage = 80,
}: CompressorAllImages): Promise<CompressedAllImages> => {
  const compressedPromise = images.map(async ({ fileImage, filename, type }) => {
    return await compressor({ fileImage, filename, type, percentage });
  });
  const blobsFailedReason: string[] = [];
  const compressed = (await Promise.allSettled(compressedPromise))
    .map((response) => {
      if (response.status === 'fulfilled') return response.value;
      blobsFailedReason.push(response.reason);
      return undefined;
    })
    .filter((val) => val !== undefined) as CompressorLoaded[];

  return { result: compressed, blobsFailedReason };
};
