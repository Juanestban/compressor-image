interface FileProps {
  blob: Blob;
  filename: string;
}

export const getFile = ({ blob, filename }: FileProps): File => {
  return new File([blob], filename, { type: blob.type });
};
