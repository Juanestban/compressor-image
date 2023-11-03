import { type NeoFile } from '@/models';

import { getFile } from '@/utils/getFile';

/**
 *
 * @param - property `type='file'` if you want get a blob just change type property to 'blob'
 * @returns Promise<Blob | File>
 */
export const getFileBlob = async ({
  url,
  filename = '',
  type = 'blob',
}: NeoFile): Promise<Blob | File> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    if (type === 'blob') return blob;

    const file = getFile({ blob, filename });
    return file;
  } catch (track) {
    throw new Error(
      `Error to try get image from [url=${url}]\n Error Track: ${JSON.stringify(track)}`,
    );
  }
};
